-- Strona VSL po quizie, zakup Mapy Relacji online (operator płatności: Stripe Checkout),
-- rezerwacja terminu konsultacji z wolnych terminów dodanych w panelu.

-- Powiązanie przeglądarki z prośbą o kontakt (token w ciasteczku httpOnly, w bazie tylko hash)
alter table leads add column if not exists access_token_hash text unique;
alter table leads add column if not exists anon_id text check (anon_id is null or length(anon_id) between 8 and 64);

-- Zamówienia. Status „paid” ustawia wyłącznie potwierdzenie z systemu płatności (webhook lub zapytanie API operatora).
create table orders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product text not null default 'mapa_relacji_individual',
  amount_pln int not null check (amount_pln > 0),
  status text not null default 'created' check (status in ('created', 'open', 'pending', 'paid', 'failed', 'expired')),
  provider text not null default 'stripe',
  provider_session_id text unique,
  provider_payment_id text,
  checkout_url text,
  checkout_expires_at timestamptz,
  returned_cancel_at timestamptz,             -- powrót z bramki przyciskiem „wróć/anuluj” (płatność przerwana)
  access_token_hash text not null unique,     -- strona zamówienia /zamowienie/<token>
  token_enc text,                             -- zaszyfrowany token (do linku w e-mailu z potwierdzeniem)
  terms_version text not null,
  terms_accepted_at timestamptz not null,
  start_consent_at timestamptz not null,      -- żądanie rozpoczęcia usługi przed upływem terminu na odstąpienie
  paid_at timestamptz,
  failed_reason text,
  customer_email text,
  case_id uuid references cases(id),
  access_enc text                              -- zaszyfrowany link i kod do kwestionariusza (widoczne tylko na stronie zamówienia)
);
create index on orders(lead_id);
create unique index orders_one_paid_per_lead on orders(lead_id) where status = 'paid';

-- Powiadomienia operatora płatności – każde przetwarzane dokładnie raz (powtórzenia są ignorowane)
create table payment_events (
  id text primary key,
  order_id uuid references orders(id),
  type text not null,
  received_at timestamptz not null default now()
);

-- Wolne terminy konsultacji (dodawane w panelu) i rezerwacja po zakupie
create table booking_slots (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references therapists(id),
  starts_at timestamptz not null,
  minutes int not null default 60 check (minutes in (60, 90)),
  status text not null default 'free' check (status in ('free', 'booked', 'cancelled')),
  order_id uuid unique references orders(id),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  unique (therapist_id, starts_at)
);
create index on booking_slots(starts_at) where status = 'free';

alter table orders enable row level security;
alter table payment_events enable row level security;
alter table booking_slots enable row level security;
-- Zamówienia: zespół czyta, zapis wyłącznie przez serwer (rola system) po weryfikacji tokenu lub podpisu operatora
create policy ord_staff_read on orders for select using (app_is_staff());
create policy ord_sys on orders using (app_is_system()) with check (app_is_system());
create policy pe_sys on payment_events using (app_is_system()) with check (app_is_system());
create policy pe_admin_read on payment_events for select using (app_is_admin());
-- Terminy: psycholog zarządza swoimi, administrator wszystkimi
create policy bs_staff on booking_slots
  using (app_is_admin() or app_is_system() or (app_kind() = 'therapist' and therapist_id = app_uuid('app.therapist_id')))
  with check (app_is_admin() or app_is_system() or (app_kind() = 'therapist' and therapist_id = app_uuid('app.therapist_id')));
grant select, insert, update on orders to duo_app;
grant select, insert on payment_events to duo_app;
grant select, insert, update, delete on booking_slots to duo_app;

-- Zdarzenia lejka strony VSL i zakupu (bez treści odpowiedzi)
alter table funnel_events drop constraint if exists funnel_events_event_check;
alter table funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view', 'hero_cta_click', 'sticky_cta_click', 'sample_report_open', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
  'lead_form_viewed', 'lead_submitted', 'lead_submission_error',
  'vsl_page_view', 'vsl_play', 'vsl_25_percent', 'vsl_50_percent', 'vsl_75_percent', 'vsl_completed',
  'checkout_click', 'checkout_started', 'purchase_completed', 'purchase_failed'));

-- Zdarzenia zapisywane przez serwer (start płatności, zakup) – rola system
create policy fe_sys_insert on funnel_events for insert with check (app_is_system());
