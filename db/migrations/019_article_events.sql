-- Artykuły „Wiedzy”: wejście na artykuł i kliknięcie w kontener z materiałem (krok = numer materiału 1–10).
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error',
  'vsl_page_view', 'vsl_play', 'vsl_25_percent', 'vsl_50_percent', 'vsl_75_percent', 'vsl_completed',
  'checkout_click', 'checkout_started', 'purchase_completed', 'purchase_failed',
  'knowledge_hub_view', 'lead_magnet_landing_view', 'lead_magnet_form_view', 'lead_magnet_form_started', 'lead_magnet_submitted',
  'lead_magnet_delivery_success', 'lead_magnet_delivery_error', 'lead_magnet_demo_view', 'lead_magnet_pdf_download', 'mapa_relacji_cta_click',
  'article_view', 'article_cta_click'));
