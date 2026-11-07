-- Krótki link do materiału (np. duo.pl/plan/k7m2xq9) – do e-maili i SMS-ów. 7 znaków: krótki, ale nie do odgadnięcia
-- (link daje dostęp do odpowiedzi; przy zapisie z numerem i tak wymagany jest kod SMS).
alter table content_leads add column if not exists short_code text unique check (short_code is null or short_code ~ '^[a-z0-9]{7}$');
update content_leads set short_code = substr(encode(gen_random_bytes(8), 'hex'), 1, 7) where short_code is null;
