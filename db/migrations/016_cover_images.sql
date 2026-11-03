-- Zdjęciowe okładki materiałów „Wiedza” generowane z panelu (OpenAI Images) – zapisane w bazie, bo pliki
-- na serwerze aplikacji znikają przy każdym wdrożeniu. Serwowane publicznie pod /wiedza-okladki/<slug>.
create table cover_images (
  slug text primary key check (slug ~ '^[a-z0-9-]{3,80}$'),
  mime text not null check (mime in ('image/webp', 'image/jpeg', 'image/png')),
  data bytea not null check (octet_length(data) <= 4000000),
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table cover_images enable row level security;
create policy ci_rw on cover_images using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
grant select, insert, update, delete on cover_images to duo_app;
