-- Uczestnik może wyczyścić własną odpowiedź, dopóki kwestionariusz jest otwarty.
create policy ans_self_del on answers for delete using (
  app_kind() = 'participant' and participant_id = app_uuid('app.participant_id') and app_participant_can_write());
