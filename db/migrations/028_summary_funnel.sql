-- Lejek materiału krok po kroku: wysłanie podsumowania e-mailem i przejście z podsumowania do oferty Mapy Relacji.
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error',
  'vsl_page_view', 'vsl_play', 'vsl_25_percent', 'vsl_50_percent', 'vsl_75_percent', 'vsl_completed',
  'checkout_click', 'checkout_started', 'purchase_completed', 'purchase_failed',
  'knowledge_hub_view', 'lead_magnet_landing_view', 'lead_magnet_form_view', 'lead_magnet_form_started', 'lead_magnet_submitted',
  'lead_magnet_delivery_success', 'lead_magnet_delivery_error', 'lead_magnet_demo_view', 'lead_magnet_pdf_download', 'mapa_relacji_cta_click',
  'article_view', 'article_cta_click', 'lead_magnet_summary_view', 'lead_magnet_phone_saved',
  'lead_magnet_summary_email', 'lead_magnet_offer_click'));
alter table content_answers add column if not exists summary_emailed_at timestamptz;
