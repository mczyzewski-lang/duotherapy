-- Numer kroku w lejku = numer materiału „Wiedza” (n). Materiałów jest już ponad 20 – limit 1–20 blokował zapis
-- (a wraz z nim cały formularz odbioru materiału). Zapas do 99.
alter table funnel_events drop constraint if exists funnel_events_step_check;
alter table funnel_events add constraint funnel_events_step_check check (step between 1 and 99);
