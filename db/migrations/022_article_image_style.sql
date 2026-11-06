-- Wersja stylu ilustracji artykułów: wcześniejsze grafiki (styl 1) panel oznacza jako „stary styl” i pozwala je odświeżyć hurtowo.
alter table article_images add column if not exists style_version int not null default 1;
