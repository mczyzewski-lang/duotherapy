-- Optymalizacja landingu Mapy Relacji:
-- 1) dwa dodatkowe zdarzenia lejka (bez treści odpowiedzi): otwarcie przykładowej Mapy Relacji i klik w przyklejone CTA na telefonie,
-- 2) faktyczna wartość sprzedaży przy zgłoszeniu (do CAC / przychodu w panelu Lejek).
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error'));

alter table leads add column if not exists sale_amount_pln int check (sale_amount_pln between 0 and 100000);
