-- Ilustracje artykułów (grafika na górze + infografiki-ilustracje w treści) generowane z panelu (OpenAI).
-- W bazie, bo pliki na serwerze aplikacji znikają przy wdrożeniu. Serwowane publicznie pod /wiedza-grafiki/<klucz>.
create table article_images (
  key text primary key check (key ~ '^[a-z0-9-]{3,160}$'),
  mime text not null check (mime in ('image/webp', 'image/jpeg', 'image/png')),
  data bytea not null check (octet_length(data) <= 4000000),
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table article_images enable row level security;
create policy ai_rw on article_images using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
grant select, insert, update, delete on article_images to duo_app;
