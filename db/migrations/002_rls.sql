-- Row Level Security. Kontekst aktora ustawiany jest w każdej transakcji przez aplikację
-- (src/lib/db.ts → withActor) za pomocą set_config(..., true):
--   app.kind            admin | therapist | participant | report_viewer | public | system
--   app.user_id         uuid użytkownika panelu
--   app.therapist_id    uuid specjalisty
--   app.participant_id  uuid uczestnika (link do kwestionariusza)
--   app.share_id        uuid udostępnienia raportu
-- Bez ustawionego kontekstu rola duo_app nie widzi żadnych danych.

create function app_kind() returns text language sql stable as $$ select coalesce(current_setting('app.kind', true), '') $$;
create function app_uuid(name text) returns uuid language sql stable as $$
  select nullif(current_setting(name, true), '')::uuid $$;
create function app_is_admin() returns boolean language sql stable as $$ select app_kind() = 'admin' $$;
create function app_is_system() returns boolean language sql stable as $$ select app_kind() = 'system' $$;
create function app_is_staff() returns boolean language sql stable as $$ select app_kind() in ('admin', 'therapist') $$;

-- Funkcje SECURITY DEFINER (właściciel schematu omija RLS) – unikają rekurencji polityk.
create function app_can_case(c uuid) returns boolean language sql stable security definer set search_path = public as $$
  select app_kind() in ('admin', 'system')
      or (app_kind() = 'therapist' and exists (select 1 from cases where id = c and therapist_id = app_uuid('app.therapist_id')))
$$;
create function app_case_of_participant(p uuid) returns uuid language sql stable security definer set search_path = public as $$
  select case_id from participants where id = p
$$;
create function app_can_participant(p uuid) returns boolean language sql stable security definer set search_path = public as $$
  select app_can_case(app_case_of_participant(p))
$$;
create function app_participant_can_write() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from participants where id = app_uuid('app.participant_id')
                 and q_status in ('not_started', 'in_progress', 'reopened') and anonymized_at is null)
$$;
create function app_share_report() returns uuid language sql stable security definer set search_path = public as $$
  select report_id from report_shares where id = app_uuid('app.share_id') and revoked_at is null and expires_at > now()
$$;
create function app_share_version() returns uuid language sql stable security definer set search_path = public as $$
  select report_version_id from report_shares where id = app_uuid('app.share_id') and revoked_at is null and expires_at > now()
$$;

-- Oznaczenie "wymaga pilnego przeglądu przed sesją" – wywoływane przy zapisie odpowiedzi uczestnika.
-- Nie ujawnia uczestnikowi żadnych danych; nie dotyka drugiej osoby w sprawie.
create function app_flag_risk(keys text[]) returns void language plpgsql security definer set search_path = public as $$
declare p uuid := app_uuid('app.participant_id');
begin
  if app_kind() <> 'participant' or p is null then raise exception 'not allowed'; end if;
  insert into risk_review_statuses (case_id, participant_id, trigger_keys)
  values (app_case_of_participant(p), p, keys)
  on conflict (participant_id) do update
    set trigger_keys = (select array(select distinct unnest(risk_review_statuses.trigger_keys || excluded.trigger_keys))),
        status = case when risk_review_statuses.status = 'reviewed' then 'needs_review' else risk_review_statuses.status end,
        updated_at = now();
end $$;

-- ---------------------------------------------------------------------------
alter table users enable row level security;
create policy users_sys on users using (app_is_system() or app_is_admin()) with check (app_is_system() or app_is_admin());
create policy users_self on users for select using (app_kind() = 'therapist' and id = app_uuid('app.user_id'));
create policy users_self_upd on users for update using (app_kind() = 'therapist' and id = app_uuid('app.user_id'))
  with check (id = app_uuid('app.user_id') and role = 'therapist');

alter table therapists enable row level security;
create policy th_read on therapists for select using (app_is_staff() or app_is_system() or (app_kind() = 'public' and is_public));
create policy th_write on therapists using (app_is_admin() or app_is_system()) with check (app_is_admin() or app_is_system());
create policy th_self on therapists for update using (app_kind() = 'therapist' and id = app_uuid('app.therapist_id'))
  with check (id = app_uuid('app.therapist_id'));

alter table auth_sessions enable row level security;
create policy as_sys on auth_sessions using (app_is_system()) with check (app_is_system());

alter table rate_limits enable row level security;
create policy rl_sys on rate_limits using (app_is_system()) with check (app_is_system());

alter table app_settings enable row level security;
create policy set_read on app_settings for select using (app_kind() <> '');
create policy set_write on app_settings using (app_is_admin() or app_is_system()) with check (app_is_admin() or app_is_system());

alter table leads enable row level security;
create policy leads_staff on leads using (app_is_staff() or app_is_system()) with check (app_is_staff() or app_is_system());
create policy leads_public_insert on leads for insert with check (app_kind() = 'public' and stage = 'new' and case_id is null);

alter table lead_activities enable row level security;
create policy la_staff on lead_activities using (app_is_staff() or app_is_system()) with check (app_is_staff() or app_is_system());
create policy la_public_insert on lead_activities for insert with check (app_kind() = 'public' and kind = 'system');

alter table questionnaire_templates enable row level security;
create policy qt_read on questionnaire_templates for select using (app_kind() in ('admin', 'therapist', 'participant', 'system'));
create policy qt_write on questionnaire_templates using (app_is_admin() or app_is_system()) with check (app_is_admin() or app_is_system());

alter table questionnaire_template_versions enable row level security;
create policy qtv_read on questionnaire_template_versions for select using (app_kind() in ('admin', 'therapist', 'participant', 'system'));
create policy qtv_write on questionnaire_template_versions using (app_is_admin() or app_is_system()) with check (app_is_admin() or app_is_system());

alter table questions enable row level security;
create policy q_read on questions for select using (app_kind() in ('admin', 'therapist', 'participant', 'system'));
create policy q_write on questions using (app_is_admin() or app_is_system()) with check (app_is_admin() or app_is_system());

alter table cases enable row level security;
create policy cases_staff on cases using (app_can_case(id))
  with check (app_is_admin() or app_is_system() or (app_kind() = 'therapist' and therapist_id = app_uuid('app.therapist_id')));
create policy cases_participant on cases for select using (app_kind() = 'participant' and id = app_case_of_participant(app_uuid('app.participant_id')));

alter table participants enable row level security;
create policy part_staff on participants using (app_can_case(case_id)) with check (app_can_case(case_id));
create policy part_self on participants for select using (app_kind() = 'participant' and id = app_uuid('app.participant_id'));
create policy part_self_upd on participants for update using (app_kind() = 'participant' and id = app_uuid('app.participant_id'))
  with check (id = app_uuid('app.participant_id'));

alter table invitations enable row level security;
create policy inv_staff on invitations using (app_can_participant(participant_id)) with check (app_can_participant(participant_id));

alter table participant_sessions enable row level security;
create policy ps_sys on participant_sessions using (app_is_system()) with check (app_is_system());
create policy ps_staff on participant_sessions for update using (app_can_participant(participant_id));

alter table consents enable row level security;
create policy cons_staff on consents using (
  (participant_id is not null and app_can_participant(participant_id)) or (lead_id is not null and (app_is_staff() or app_is_system()))
) with check (
  (participant_id is not null and app_can_participant(participant_id)) or (lead_id is not null and (app_is_staff() or app_is_system()))
);
create policy cons_self on consents for select using (app_kind() = 'participant' and participant_id = app_uuid('app.participant_id'));
create policy cons_self_ins on consents for insert with check (app_kind() = 'participant' and participant_id = app_uuid('app.participant_id') and recorded_by is null);
create policy cons_public on consents for insert with check (app_kind() = 'public' and lead_id is not null and participant_id is null);

alter table answers enable row level security;
create policy ans_staff on answers using (app_can_participant(participant_id)) with check (app_can_participant(participant_id));
create policy ans_self_sel on answers for select using (app_kind() = 'participant' and participant_id = app_uuid('app.participant_id'));
create policy ans_self_ins on answers for insert with check (
  app_kind() = 'participant' and participant_id = app_uuid('app.participant_id') and app_participant_can_write() and updated_by_user is null);
create policy ans_self_upd on answers for update using (app_kind() = 'participant' and participant_id = app_uuid('app.participant_id') and app_participant_can_write())
  with check (participant_id = app_uuid('app.participant_id') and updated_by_user is null);

alter table answer_revisions enable row level security;
create policy rev_staff on answer_revisions using (app_can_participant(participant_id)) with check (app_can_participant(participant_id));
create policy rev_self_ins on answer_revisions for insert with check (
  app_kind() = 'participant' and participant_id = app_uuid('app.participant_id') and changed_by_participant = app_uuid('app.participant_id') and changed_by_user is null);

-- Notatki psychologa: nigdy dla uczestnika.
alter table session_notes enable row level security;
create policy notes_staff on session_notes using (app_is_staff() and app_can_case(case_id)) with check (app_is_staff() and app_can_case(case_id));

alter table risk_review_statuses enable row level security;
create policy risk_staff on risk_review_statuses using (app_is_staff() and app_can_case(case_id)) with check (app_is_staff() and app_can_case(case_id));

alter table session_slots enable row level security;
create policy slots_staff on session_slots using (app_can_case(case_id)) with check (app_can_case(case_id));
create policy slots_self on session_slots for select using (app_kind() = 'participant' and case_id = app_case_of_participant(app_uuid('app.participant_id')));
create policy slots_self_choose on session_slots for update using (
  app_kind() = 'participant' and case_id = app_case_of_participant(app_uuid('app.participant_id')) and status in ('offered', 'chosen'))
  with check (status in ('offered', 'chosen') and (chosen_by is null or chosen_by = app_uuid('app.participant_id')));

alter table reports enable row level security;
create policy rep_staff on reports using (app_is_staff() and app_can_case(case_id)) with check (app_is_staff() and app_can_case(case_id));
create policy rep_view on reports for select using (app_kind() = 'report_viewer' and id = app_share_report());

alter table report_versions enable row level security;
create policy repv_staff on report_versions using (app_is_staff() and exists (select 1 from reports r where r.id = report_id and app_can_case(r.case_id)))
  with check (app_is_staff() and exists (select 1 from reports r where r.id = report_id and app_can_case(r.case_id)));
create policy repv_view on report_versions for select using (app_kind() = 'report_viewer' and id = app_share_version());

alter table report_shares enable row level security;
create policy rs_staff on report_shares using (app_is_staff() and app_can_participant(participant_id)) with check (app_is_staff() and app_can_participant(participant_id));
create policy rs_sys on report_shares using (app_is_system()) with check (app_is_system());
create policy rs_view on report_shares for select using (app_kind() = 'report_viewer' and id = app_uuid('app.share_id'));

alter table audit_logs enable row level security;
create policy audit_insert on audit_logs for insert with check (app_kind() <> '');
create policy audit_read on audit_logs for select using (app_is_admin() or (app_kind() = 'therapist' and case_id is not null and app_can_case(case_id)));

-- Uprawnienia roli aplikacji (bez DDL, bez TRUNCATE).
grant usage on schema public to duo_app;
grant select, insert, update, delete on all tables in schema public to duo_app;
revoke update, delete on audit_logs from duo_app;
grant usage, select on all sequences in schema public to duo_app;
grant execute on all functions in schema public to duo_app;

-- Uczestnik może zmienić wyłącznie status własnego kwestionariusza, i to tylko "do przodu".
create function guard_participant_update() returns trigger language plpgsql as $$
begin
  if app_kind() = 'participant' then
    if (new.case_id, new.position, new.display_name, new.gender, new.email, new.phone, new.template_version_id,
        new.reopened_by, new.reopened_at, new.reopen_reason, new.anonymized_at)
       is distinct from
       (old.case_id, old.position, old.display_name, old.gender, old.email, old.phone, old.template_version_id,
        old.reopened_by, old.reopened_at, old.reopen_reason, old.anonymized_at) then
      raise exception 'Uczestnik nie może zmieniać tych danych';
    end if;
    if old.q_status = 'submitted' then
      raise exception 'Kwestionariusz został już przekazany';
    end if;
    if new.q_status not in ('in_progress', 'submitted', 'reopened') then
      raise exception 'Niedozwolona zmiana statusu';
    end if;
  end if;
  return new;
end $$;
create trigger participants_guard before update on participants for each row execute function guard_participant_update();
