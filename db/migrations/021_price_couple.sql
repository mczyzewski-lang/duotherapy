-- Cena Mapy Relacji dla Was (3 spotkania): 1270 zł – ustawiana tylko, gdy w panelu nie wpisano innej.
update app_settings set value = jsonb_set(value, '{priceCouple}', '"1270 zł"')
 where key = 'site' and coalesce(value->>'priceCouple', '') = '';
-- FAQ zapisane w ustawieniach: zamiast „omówisz z konsultantem” – konkretna cena wariantu dla Was.
update app_settings set value = replace(value::text,
  'Mapę Relacji dla Was (3 spotkania: z Tobą, z partnerem i wspólne, dwa kwestionariusze) omówisz z konsultantem.',
  'Mapa Relacji dla Was kosztuje 1270 zł – obejmuje dwa kwestionariusze, 3 spotkania online (z Tobą, z partnerem i wspólne) oraz pisemne podsumowanie. Obie ceny są jednorazowe.')::jsonb
 where key = 'site';
