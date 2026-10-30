-- Przeliczenie statusu sprawy po działaniu uczestnika (uczestnik nie ma prawa odczytu drugiej osoby,
-- więc przeliczenie wykonuje funkcja właściciela schematu, bez zwracania danych).
create function app_participant_progress() returns void language plpgsql security definer set search_path = public as $$
declare
  c uuid := app_case_of_participant(app_uuid('app.participant_id'));
  cur text;
  all_done boolean;
  any_started boolean;
begin
  if app_kind() <> 'participant' or c is null then raise exception 'not allowed'; end if;
  select status into cur from cases where id = c;
  if cur not in ('new', 'awaiting_questionnaire', 'questionnaire_partial', 'ready_for_session') then return; end if;
  select bool_and(q_status = 'submitted'), bool_or(q_status <> 'not_started') into all_done, any_started from participants where case_id = c;
  update cases set status = case when all_done then 'ready_for_session' when any_started then 'questionnaire_partial' else status end,
                   updated_at = now()
   where id = c;
end $$;
grant execute on function app_participant_progress() to duo_app;
