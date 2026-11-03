-- Zasada redakcyjna: półpauza (U+2013) zamiast pauzy (U+2014) we wszystkich treściach – także tych już zapisanych w bazie
-- (e-maile sekwencji, ustawienia strony). Znaki zapisane kodami, żeby w repozytorium nie było pauzy.
update mail_steps set subject = replace(subject, chr(8212), chr(8211)), preheader = replace(preheader, chr(8212), chr(8211)),
                      body = replace(body, chr(8212), chr(8211)), cta_label = replace(cta_label, chr(8212), chr(8211))
 where position(chr(8212) in subject || preheader || body || cta_label) > 0;
update app_settings set value = replace(value::text, chr(8212), chr(8211))::jsonb where position(chr(8212) in value::text) > 0;
