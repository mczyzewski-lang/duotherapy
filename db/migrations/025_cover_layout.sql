-- Okładki 2D: wersja układu (1 = pionowa grafika z pustym miejscem na tytuł; 2 = pozioma grafika jako pas między tytułem a cytatem).
alter table cover_images add column if not exists layout_version int not null default 1;
