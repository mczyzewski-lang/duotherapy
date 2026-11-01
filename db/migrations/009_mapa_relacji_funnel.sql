-- Lejek „Mapa Relacji”: prośba o telefon po krótkim quizie + pierwszopartyjne zdarzenia lejka.

-- Zgłoszenie z quizu wymaga telefonu; e-mail, forma i intencja są opcjonalne.
alter table leads alter column email drop not null;
alter table leads alter column mode drop not null;
alter table leads alter column intent drop not null;
alter table leads alter column preferred_contact set default 'phone';
alter table leads add column product text not null default 'mapa_relacji';
alter table leads add column quiz_enc text;            -- odpowiedzi z quizu (szyfrowane) – tylko dla zespołu
alter table leads add column quiz_version text;
alter table leads add column segment text check (segment in ('rebuild', 'unsure', 'separate', 'one_sided'));
alter table leads add column preferred_time text;
alter table leads add column attribution jsonb not null default '{}'::jsonb;  -- UTM, źródło, strona wejścia (bez danych osobowych)
alter table leads add column ab_variant text;

-- Zdarzenia lejka: bez treści odpowiedzi, bez IP, z losowym identyfikatorem sesji przeglądarki.
create table funnel_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  event text not null check (event in (
    'landing_view', 'hero_cta_click', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
    'lead_form_viewed', 'lead_submitted', 'lead_submission_error')),
  anon_id text not null check (length(anon_id) between 8 and 64),
  variant text check (variant in ('A', 'B')),
  step int check (step between 1 and 6),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  path text
);
create index on funnel_events(created_at);
create index on funnel_events(event, created_at);
alter table funnel_events enable row level security;
create policy fe_public_insert on funnel_events for insert with check (app_kind() = 'public');
create policy fe_staff_read on funnel_events for select using (app_is_staff());
grant select, insert on funnel_events to duo_app;
grant usage, select on sequence funnel_events_id_seq to duo_app;
