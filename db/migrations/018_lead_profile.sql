-- Formularz materiału: stan związku i dzieci (wybór jednym kliknięciem). Używane do dopasowania wiadomości (tagi kontaktu).
alter table content_leads add column if not exists relationship text check (relationship in ('para', 'malzenstwo'));
alter table content_leads add column if not exists has_children boolean;
