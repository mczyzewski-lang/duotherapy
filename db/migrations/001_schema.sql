-- DUO™ – schemat bazy danych.
-- Migracje uruchamia rola właściciela (DATABASE_OWNER_URL). Aplikacja łączy się jako rola
-- "duo_app" bez uprawnień superużytkownika – każdy odczyt i zapis podlega politykom RLS (002_rls.sql).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Użytkownicy panelu i specjaliści
-- ---------------------------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'therapist')),
  password_hash text not null,
  mfa_secret text,               -- zaszyfrowany sekret TOTP
  mfa_enabled boolean not null default false,
  disabled boolean not null default false,
  failed_logins int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  display_name text not null,
  title text,                    -- np. "psycholog" – uzupełnia właściciel usługi
  bio text,
  is_public boolean not null default false, -- widoczny na stronie głównej dopiero po uzupełnieniu i zatwierdzeniu
  created_at timestamptz not null default now()
);

create table auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  mfa_passed boolean not null default false,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create table rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null
);

-- ---------------------------------------------------------------------------
-- Ustawienia aplikacji (treści, dane administratora, teksty zgód, integracje)
-- ---------------------------------------------------------------------------
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Zgłoszenia (lejek: quiz → rozmowa → płatność → sprawa)
-- ---------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  mode text not null check (mode in ('individual', 'couple')),
  intent text not null check (intent in ('rebuild', 'unsure', 'separate')),
  preferred_contact text not null check (preferred_contact in ('phone', 'email', 'sms')),
  quiz jsonb not null default '{}'::jsonb,       -- odpowiedzi krótkiego quizu (bez danych o zdrowiu)
  stage text not null default 'new' check (stage in ('new', 'contacted', 'call_scheduled', 'call_done', 'payment_sent', 'paid', 'converted', 'lost')),
  call_at timestamptz,
  assigned_therapist_id uuid references therapists(id),
  case_id uuid,
  lost_reason text,
  updated_at timestamptz not null default now()
);

create table lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  user_id uuid references users(id),
  kind text not null check (kind in ('note', 'call', 'email', 'stage', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Szablony kwestionariuszy (wersjonowane)
-- ---------------------------------------------------------------------------
create table questionnaire_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('couple_male', 'couple_female', 'individual_male', 'individual_female')),
  audience text not null check (audience in ('couple', 'individual')),
  gender text not null check (gender in ('male', 'female')),
  name text not null,
  created_at timestamptz not null default now()
);

create table questionnaire_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references questionnaire_templates(id) on delete restrict,
  version int not null,
  status text not null check (status in ('draft', 'published', 'archived')),
  title text not null,
  intro jsonb not null,          -- lista akapitów "Zanim zaczniesz"
  outro text,
  sections jsonb not null,       -- metadane sekcji (klucz, tytuł, wstęp, legenda skali, obszar)
  source_file text not null,
  needs_verification boolean not null default false,
  verification_note text,
  change_note text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (template_id, version)
);
-- najwyżej jedna opublikowana wersja na szablon
create unique index one_published_per_template on questionnaire_template_versions(template_id) where status = 'published';

create table questions (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references questionnaire_template_versions(id) on delete cascade,
  key text not null,
  section_key text not null,
  ord int not null,
  source_number text,
  type text not null,
  prompt text not null,
  hint text,
  options jsonb,
  primary_pick text,
  required boolean not null default false,
  allow_na boolean not null default false,
  show_if jsonb,
  group_label text,
  tags text[] not null default '{}',
  source jsonb not null,
  unique (version_id, key)
);

-- Wersje opublikowane są niezmienne (ochrona starych odpowiedzi i raportów).
create function forbid_published_question_change() returns trigger language plpgsql as $$
declare st text;
begin
  select status into st from questionnaire_template_versions
   where id = coalesce(new.version_id, old.version_id);
  if st <> 'draft' then
    raise exception 'Pytania opublikowanej wersji szablonu są niezmienne';
  end if;
  return coalesce(new, old);
end $$;
create trigger questions_immutable before insert or update or delete on questions
  for each row execute function forbid_published_question_change();

create function forbid_published_version_change() returns trigger language plpgsql as $$
begin
  if old.status <> 'draft' and (new.sections is distinct from old.sections or new.intro is distinct from old.intro
     or new.title is distinct from old.title or new.outro is distinct from old.outro) then
    raise exception 'Treść opublikowanej wersji szablonu jest niezmienna';
  end if;
  return new;
end $$;
create trigger versions_immutable before update on questionnaire_template_versions
  for each row execute function forbid_published_version_change();

-- ---------------------------------------------------------------------------
-- Sprawy i uczestnicy
-- ---------------------------------------------------------------------------
create table cases (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,      -- czytelny numer sprawy, np. DUO-2026-0001
  kind text not null check (kind in ('individual', 'couple')),
  status text not null default 'new' check (status in (
    'new', 'awaiting_questionnaire', 'questionnaire_partial', 'ready_for_session',
    'session_done', 'report_in_progress', 'report_approved', 'report_shared', 'closed')),
  lead_id uuid references leads(id),
  therapist_id uuid not null references therapists(id),
  goal text,
  intent text check (intent in ('rebuild', 'unsure', 'separate')),
  session_at timestamptz,
  session_minutes int not null check (session_minutes in (60, 90)),
  session_started_at timestamptz,
  session_ended_at timestamptz,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'waived')),
  payment_note text,
  secrets_rule text check (secrets_rule in ('no_secrets', 'secrets_allowed')),
  is_demo boolean not null default false,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
alter table leads add constraint leads_case_fk foreign key (case_id) references cases(id);

create table participants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  position int not null check (position in (1, 2)),
  display_name text not null,    -- imię używane w powitaniu
  gender text not null check (gender in ('male', 'female')),
  email text,
  phone text,
  template_version_id uuid not null references questionnaire_template_versions(id),
  q_status text not null default 'not_started' check (q_status in ('not_started', 'in_progress', 'submitted', 'reopened')),
  q_started_at timestamptz,
  q_submitted_at timestamptz,
  reopened_by uuid references users(id),
  reopened_at timestamptz,
  reopen_reason text,
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  unique (case_id, position)
);

-- Linki do kwestionariusza: token i kod dostępu przechowywane wyłącznie jako hash.
create table invitations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  token_hash text not null unique,
  code_hash text,                -- 6-cyfrowy kod przekazywany innym kanałem (np. telefonicznie)
  expires_at timestamptz not null,
  revoked_at timestamptz,
  failed_attempts int not null default 0,
  last_used_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table participant_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  invitation_id uuid not null references invitations(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

-- Rejestr zgód (wersja i treść tekstu w chwili udzielenia).
create table consents (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  kind text not null check (kind in ('lead_contact', 'lead_marketing', 'data_processing', 'declaration', 'disclosure_to_partner')),
  granted boolean not null,
  text_version text not null,
  text_snapshot text not null,
  recorded_by uuid references users(id), -- dla zgód odnotowanych przez psychologa (np. na ujawnienie)
  scope text,
  created_at timestamptz not null default now(),
  check (participant_id is not null or lead_id is not null)
);

-- ---------------------------------------------------------------------------
-- Odpowiedzi (szyfrowane na poziomie aplikacji) i ich historia
-- ---------------------------------------------------------------------------
create table answers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  question_id uuid not null references questions(id),
  state text not null check (state in ('answered', 'not_applicable', 'discuss_in_session')),
  value_enc text,                -- AES-256-GCM, JSON wartości
  updated_at timestamptz not null default now(),
  updated_by_user uuid references users(id),  -- ustawione, gdy zmiana wprowadzona przez psychologa
  unique (participant_id, question_id)
);

create table answer_revisions (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references answers(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  old_state text,
  old_value_enc text,
  new_state text not null,
  new_value_enc text,
  changed_by_user uuid references users(id),
  changed_by_participant uuid references participants(id),
  reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notatki psychologa, status przeglądu bezpieczeństwa, terminy
-- ---------------------------------------------------------------------------
create table session_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  question_id uuid references questions(id),
  kind text not null check (kind in ('private', 'discussed', 'report')),
  -- czy treść może trafić do raportu wspólnego (dla pary). Domyślnie NIE.
  joint_ok boolean not null default false,
  tags text[] not null default '{}',   -- 'to_check', 'important', 'discussed'
  stage text,                           -- etap sesji, na którym powstała notatka
  body_enc text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table risk_review_statuses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  participant_id uuid not null unique references participants(id) on delete cascade,
  trigger_keys text[] not null,
  status text not null default 'needs_review' check (status in ('needs_review', 'contacted', 'reviewed', 'safety_path')),
  note_enc text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table session_slots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  starts_at timestamptz not null,
  minutes int not null,
  status text not null default 'offered' check (status in ('offered', 'chosen', 'confirmed', 'cancelled')),
  chosen_by uuid references participants(id),
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Raporty
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  audience text not null check (audience in ('joint', 'participant')),
  participant_id uuid references participants(id) on delete cascade, -- dla raportu osobnego
  status text not null default 'draft' check (status in ('draft', 'approved', 'shared')),
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((audience = 'participant') = (participant_id is not null))
);

create table report_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  version int not null,
  content_enc text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  approved_by uuid references users(id),
  approved_at timestamptz,
  unique (report_id, version)
);

create table report_shares (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  report_version_id uuid not null references report_versions(id),
  participant_id uuid not null references participants(id) on delete cascade,
  token_hash text not null unique,
  code_hash text not null,
  expires_at timestamptz not null,
  disclosure_confirmed boolean not null default false, -- potwierdzenie zakresu ujawnienia przy raporcie wspólnym
  failed_attempts int not null default 0,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  revoked_at timestamptz
);

-- Raport można udostępnić wyłącznie w wersji zatwierdzonej.
create function require_approved_version() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from report_versions where id = new.report_version_id and approved_at is not null) then
    raise exception 'Udostępnić można tylko zatwierdzoną wersję raportu';
  end if;
  return new;
end $$;
create trigger report_shares_approved before insert on report_shares
  for each row execute function require_approved_version();

-- ---------------------------------------------------------------------------
-- Dziennik audytowy (bez treści wrażliwych)
-- ---------------------------------------------------------------------------
create table audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_kind text not null,      -- 'user' | 'participant' | 'public' | 'system'
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  case_id uuid,
  meta jsonb not null default '{}'::jsonb
);
-- dziennik tylko do dopisywania
create function forbid_audit_change() returns trigger language plpgsql as $$
begin raise exception 'Dziennik audytowy jest tylko do dopisywania'; end $$;
create trigger audit_append_only before update or delete on audit_logs
  for each row execute function forbid_audit_change();

create index on cases(therapist_id);
create index on participants(case_id);
create index on answers(participant_id);
create index on session_notes(case_id);
create index on audit_logs(case_id);
create index on leads(stage);
