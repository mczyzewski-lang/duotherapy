-- Materiały: zapis odpowiedzi „na później” chroniony kodem SMS. Numer telefonu (potwierdzony kodem) przypisany do zapisu na materiał;
-- powrót z linku w e-mailu wymaga potwierdzenia numeru kodem SMS. Kody SMS – tylko skrót (hash), krótka ważność, limit prób.
alter table content_leads add column if not exists phone text check (phone is null or phone ~ '^\+48[0-9]{9}$');
alter table content_leads add column if not exists phone_verified_at timestamptz;
alter table content_answers add column if not exists summary_at timestamptz;   -- osoba otworzyła podsumowanie swoich odpowiedzi (lejek)

create table if not exists sms_codes (
  id uuid primary key default gen_random_uuid(),
  purpose text not null check (purpose in ('bind', 'access')),
  email_lc text not null,
  phone text not null check (phone ~ '^\+48[0-9]{9}$'),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists sms_codes_lookup on sms_codes (email_lc, purpose, created_at desc);

alter table sms_codes enable row level security;
create policy sms_sys on sms_codes using (app_is_system()) with check (app_is_system());
grant select, insert, update on sms_codes to duo_app;

-- zdarzenia lejka: otwarcie podsumowania odpowiedzi, zapis odpowiedzi „na później” z numerem telefonu
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error',
  'vsl_page_view', 'vsl_play', 'vsl_25_percent', 'vsl_50_percent', 'vsl_75_percent', 'vsl_completed',
  'checkout_click', 'checkout_started', 'purchase_completed', 'purchase_failed',
  'knowledge_hub_view', 'lead_magnet_landing_view', 'lead_magnet_form_view', 'lead_magnet_form_started', 'lead_magnet_submitted',
  'lead_magnet_delivery_success', 'lead_magnet_delivery_error', 'lead_magnet_demo_view', 'lead_magnet_pdf_download', 'mapa_relacji_cta_click',
  'article_view', 'article_cta_click', 'lead_magnet_summary_view', 'lead_magnet_phone_saved'));
