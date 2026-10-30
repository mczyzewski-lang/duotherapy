-- Polityka spraw oparta bezpośrednio na kolumnach wiersza (działa także dla INSERT ... RETURNING,
-- gdzie nowy wiersz nie jest jeszcze widoczny dla funkcji pomocniczych).
drop policy cases_staff on cases;
create policy cases_staff on cases
  using (app_is_admin() or app_is_system() or (app_kind() = 'therapist' and therapist_id = app_uuid('app.therapist_id')))
  with check (app_is_admin() or app_is_system() or (app_kind() = 'therapist' and therapist_id = app_uuid('app.therapist_id')));
