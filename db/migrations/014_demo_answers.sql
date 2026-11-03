-- Odpowiedzi z podglądu /demo (bez e-maila) dołączane do zgłoszenia z quizu: zapis bez e-maila, oznaczony źródłem.
alter table content_answers alter column email_lc drop not null;
alter table content_answers add column if not exists source text not null default 'email' check (source in ('email', 'demo'));
