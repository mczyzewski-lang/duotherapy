-- Potwierdzony numer telefonu = dostęp do wszystkich bezpłatnych materiałów („zalogowanie” kodem SMS).
-- Materiał otwarty w ten sposób dostaje własny zapis ze statusem 'unlocked' (bez wysyłki e-maila z linkiem).
alter table content_leads drop constraint if exists content_leads_delivery_status_check;
alter table content_leads add constraint content_leads_delivery_status_check
  check (delivery_status in ('pending', 'sent', 'not_configured', 'failed', 'unlocked'));
create index if not exists content_leads_phone_idx on content_leads (phone) where phone_verified_at is not null;
