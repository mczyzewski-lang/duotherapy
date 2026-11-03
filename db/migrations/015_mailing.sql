-- Nurturing e-mailowy (Resend): kontakty z tagami, sekwencje (przed zakupem → Mapa Relacji, po zakupie → bez Mapy),
-- kroki z warunkami tagów, wysyłki i kliknięcia w linki /{kod maila}/{kod osoby} – podróż kontaktu do zakupu.

create table mail_contacts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]{8}$'),     -- publiczny identyfikator osoby w linkach (bez e-maila)
  email_lc text not null unique check (length(email_lc) between 5 and 200),
  name text check (name is null or length(name) <= 80),
  tags text[] not null default '{}',
  marketing_consent boolean not null default false,
  unsubscribed_at timestamptz,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on mail_contacts using gin (tags);

create table mail_sequences (
  id text primary key check (id in ('lead', 'customer')),
  name text not null,
  trigger text not null check (trigger in ('lead', 'purchase')),
  active boolean not null default false,          -- domyślnie wyłączone: wysyłka rusza dopiero po włączeniu w panelu
  requires_consent boolean not null default true, -- sekwencja marketingowa tylko za zgodą
  updated_at timestamptz not null default now()
);

create table mail_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id text not null references mail_sequences(id) on delete cascade,
  code text not null unique check (code ~ '^[a-z]{1,2}[0-9]{1,3}$'),  -- część linku: /n3/<kod osoby>
  position int not null,
  delay_days int not null default 0 check (delay_days between 0 and 365),
  subject text not null check (length(subject) between 1 and 200),
  preheader text not null default '' check (length(preheader) <= 200),
  body text not null check (length(body) <= 20000),
  cta_label text not null default '' check (length(cta_label) <= 80),
  cta_url text not null default '/' check (cta_url ~ '^/[^/]'  or cta_url = '/'),
  include_tags text[] not null default '{}',      -- wysyłaj tylko, gdy osoba ma którykolwiek z tagów (puste = wszyscy)
  exclude_tags text[] not null default '{}',      -- nie wysyłaj, gdy osoba ma którykolwiek z tagów
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index on mail_steps (sequence_id, position);

create table mail_enrollments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references mail_contacts(id) on delete cascade,
  sequence_id text not null references mail_sequences(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'stopped', 'done')),
  stopped_reason text,
  unique (contact_id, sequence_id)
);

create table mail_sends (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references mail_contacts(id) on delete cascade,
  step_id uuid not null references mail_steps(id) on delete cascade,
  status text not null check (status in ('sent', 'skipped', 'failed')),
  reason text,
  provider_id text,
  created_at timestamptz not null default now(),
  unique (contact_id, step_id)
);

create table mail_clicks (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references mail_contacts(id) on delete cascade,
  step_id uuid references mail_steps(id) on delete cascade,
  target text not null,
  created_at timestamptz not null default now()
);
create index on mail_clicks (contact_id, created_at);

alter table leads add column if not exists mail_contact_id uuid references mail_contacts(id);
alter table orders add column if not exists mail_contact_id uuid references mail_contacts(id);

alter table mail_contacts enable row level security;
alter table mail_sequences enable row level security;
alter table mail_steps enable row level security;
alter table mail_enrollments enable row level security;
alter table mail_sends enable row level security;
alter table mail_clicks enable row level security;
-- serwer (system) zapisuje wszystko; administrator zarządza sekwencjami, krokami i tagami, resztę tylko czyta
create policy mc_rw on mail_contacts using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
create policy ms_rw on mail_sequences using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
create policy mst_rw on mail_steps using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
create policy me_sys on mail_enrollments using (app_is_system()) with check (app_is_system());
create policy me_admin on mail_enrollments for select using (app_is_admin());
create policy msd_sys on mail_sends using (app_is_system()) with check (app_is_system());
create policy msd_admin on mail_sends for select using (app_is_admin());
create policy mcl_sys on mail_clicks using (app_is_system()) with check (app_is_system());
create policy mcl_admin on mail_clicks for select using (app_is_admin());
grant select, insert, update, delete on mail_contacts, mail_sequences, mail_steps, mail_enrollments, mail_sends, mail_clicks to duo_app;
