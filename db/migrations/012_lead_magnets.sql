-- Materiały „Wiedza” (lead magnety): zapisy na materiał, zgody, historia wiadomości, zdarzenia lejka.
-- Nie zapisujemy profilu psychologicznego – tylko identyfikator materiału (nieopisowy, np. lm08).

create table content_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null unique,               -- idempotencja: ponowione wysłanie formularza nie tworzy duplikatu
  email text not null check (length(email) between 5 and 200),
  name text check (name is null or length(name) <= 80),
  magnet_id text not null check (magnet_id ~ '^lm[0-9]{2}$'),
  attribution jsonb not null default '{}'::jsonb,
  anon_id text,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'not_configured', 'failed')),
  delivered_at timestamptz,
  marketing_consent boolean not null default false,
  series_consent boolean not null default false,  -- codzienne ćwiczenia (wyzwanie 7 dni)
  unsubscribe_token_hash text not null unique,
  unsubscribe_token_enc text not null,          -- zaszyfrowany token do linku wypisania w wiadomościach
  unsubscribed_at timestamptz,
  nurture_step int not null default 0 check (nurture_step between 0 and 3),
  nurture_next_at timestamptz,
  series_day int not null default 0 check (series_day between 0 and 7),
  series_next_at timestamptz
);
create index on content_leads (lower(email), magnet_id, created_at);
create index on content_leads (nurture_next_at) where nurture_next_at is not null;

create table content_lead_consents (
  id uuid primary key default gen_random_uuid(),
  content_lead_id uuid not null references content_leads(id) on delete cascade,
  kind text not null check (kind in ('delivery_info', 'marketing', 'challenge_series', 'withdrawn')),
  granted boolean not null,
  text_version text not null,
  text_snapshot text not null,
  created_at timestamptz not null default now()
);

create table content_lead_messages (
  id uuid primary key default gen_random_uuid(),
  content_lead_id uuid not null references content_leads(id) on delete cascade,
  kind text not null,                              -- delivery | nurture_1..3 | series_day_2..7
  status text not null check (status in ('sent', 'failed', 'not_configured')),
  error text,
  created_at timestamptz not null default now()
);

alter table content_leads enable row level security;
alter table content_lead_consents enable row level security;
alter table content_lead_messages enable row level security;
-- zapis wyłącznie przez serwer (rola system) po walidacji; odczyt – tylko administrator
create policy cl_sys on content_leads using (app_is_system()) with check (app_is_system());
create policy cl_admin on content_leads for select using (app_is_admin());
create policy clc_sys on content_lead_consents using (app_is_system()) with check (app_is_system());
create policy clc_admin on content_lead_consents for select using (app_is_admin());
create policy clm_sys on content_lead_messages using (app_is_system()) with check (app_is_system());
create policy clm_admin on content_lead_messages for select using (app_is_admin());
grant select, insert, update on content_leads, content_lead_consents, content_lead_messages to duo_app;

-- zdarzenia „Wiedzy” (krok = numer materiału 1–10, bez tytułu)
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error',
  'vsl_page_view', 'vsl_play', 'vsl_25_percent', 'vsl_50_percent', 'vsl_75_percent', 'vsl_completed',
  'checkout_click', 'checkout_started', 'purchase_completed', 'purchase_failed',
  'knowledge_hub_view', 'lead_magnet_landing_view', 'lead_magnet_form_view', 'lead_magnet_form_started', 'lead_magnet_submitted',
  'lead_magnet_delivery_success', 'lead_magnet_delivery_error', 'lead_magnet_demo_view', 'lead_magnet_pdf_download', 'mapa_relacji_cta_click'));
alter table funnel_events drop constraint if exists funnel_events_step_check;
alter table funnel_events add constraint funnel_events_step_check check (step between 1 and 20);
