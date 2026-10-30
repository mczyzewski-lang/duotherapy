-- Pytania z formularza „Masz pytania? Napisz do mnie” na stronie głównej.
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message_enc text not null,          -- treść szyfrowana (może zawierać dane wrażliwe)
  consent_text text not null,
  consent_version text not null,
  status text not null default 'new' check (status in ('new', 'answered', 'archived')),
  handled_by uuid references users(id),
  handled_at timestamptz
);
alter table inquiries enable row level security;
create policy inq_staff on inquiries using (app_is_staff()) with check (app_is_staff());
create policy inq_public_insert on inquiries for insert with check (app_kind() = 'public' and status = 'new' and handled_by is null);
grant select, insert, update, delete on inquiries to duo_app;
create index on inquiries(status, created_at);
