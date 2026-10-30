-- Odcisk definicji źródłowej szablonu – pozwala automatycznie opublikować nową wersję,
-- gdy zmieni się treść w kodzie (o ile administrator nie edytował szablonu w panelu).
alter table questionnaire_template_versions add column source_hash text;
