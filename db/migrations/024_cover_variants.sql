-- Okładki materiałów w dwóch wariantach: zdjęcie (dotychczasowe) i grafika 2D (styl maskotek DUO jak w artykułach).
-- Który wariant pokazuje strona – globalny wybór w panelu (app_settings, klucz 'covers').
alter table cover_images add column if not exists variant text not null default 'photo' check (variant in ('photo', 'illustration'));
alter table cover_images drop constraint if exists cover_images_pkey;
alter table cover_images add primary key (slug, variant);
insert into app_settings (key, value) values ('covers', '{"style": "photo"}'::jsonb) on conflict (key) do nothing;
