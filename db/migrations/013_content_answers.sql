-- Materiały „Wiedza” do uzupełniania online: odpowiedzi przypisane do e-maila (zaszyfrowane), autozapis,
-- dołączanie podsumowania do zgłoszenia z quizu (za wyraźną zgodą).

alter table content_leads add column if not exists access_token_hash text unique;   -- dostęp do wersji online (ciasteczko / link z e-maila)

create table content_answers (
  id uuid primary key default gen_random_uuid(),
  email_lc text not null,
  magnet_id text not null check (magnet_id ~ '^lm[0-9]{2}$'),
  data_enc text not null,              -- odpowiedzi (JSON) – szyfrowane, mogą zawierać dane szczególnie wrażliwe
  filled int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_lc, magnet_id)
);

alter table leads add column if not exists attached_answers_id uuid references content_answers(id);
alter table leads add column if not exists attached_magnet_id text;

alter table consents drop constraint if exists consents_kind_check;
alter table consents add constraint consents_kind_check check (kind in ('lead_contact', 'lead_marketing', 'data_processing', 'declaration', 'disclosure_to_partner', 'attach_answers'));

alter table content_answers enable row level security;
create policy ca_sys on content_answers using (app_is_system()) with check (app_is_system());
-- zespół widzi wyłącznie odpowiedzi dołączone przez klienta do zgłoszenia
create policy ca_staff on content_answers for select using (app_is_staff() and exists (select 1 from leads l where l.attached_answers_id = content_answers.id));
grant select, insert, update on content_answers to duo_app;
