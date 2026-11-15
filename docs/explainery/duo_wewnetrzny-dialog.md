# Seria „wewnętrzny dialog” (W01–W10 dla niej, M01–M10 dla niego)

Format ok. 12–15 s: jedna pionowa scena. Bohater na pierwszym planie milczy, a jego myśl słychać szeptem
i widać w chmurce nad głową (etykieta „ONA MYŚLI” / „ON MYŚLI”, słowa podświetlają się w rytm szeptu).
Potem standardowy głos lektorki: „Jeżeli czasami tak myślisz, wyślij to swojemu mężowi albo partnerowi
(swojej żonie albo partnerce). Żebyście lepiej się dogadywali.” i przycisk „Wyślij mu / jej ten film”.

Głosy: ona – standardowy głos DUO szeptem; on – „Sentry – Calm & Reassuring” (ElevenLabs) szeptem;
zakończenie – standardowy głos DUO. Postaci: ona – pomarańczowa, on – zielona.

Zasady treści: myśl jest szczera i nieoskarżająca (mówi o sobie, nie ocenia drugiej strony), bez obietnic efektu.

## Dla niej

| Nr | Myśl | Scena |
|---|---|---|
| W01 | Wolałabym się wygadać, niż żeby mi doradzał, kiedy opowiadam mu o swoim problemie. | ona z poduszką na sofie, on obok wylicza rady |
| W02 | Nie chcę, żeby pomagał mi w domu. Chcę, żeby to był też jego dom. | ona z koszem prania, on w tle z telefonem |
| W03 | Chciałabym, żeby czasem zapytał, jak się czuję. A nie, co na obiad. | ona przy stole z kubkiem, on zagląda do lodówki |
| W04 | Kiedy mówię „nic się nie stało”, tak naprawdę czekam, aż zapyta jeszcze raz. | ona z założonymi rękami, on waha się w drzwiach |
| W05 | Tęsknię za nim, chociaż siedzi obok mnie na kanapie. | oboje na sofie, on wpatrzony w telewizor |
| W06 | Nie potrzebuję wielkich gestów. Wystarczy, że przytuli mnie bez powodu. | ona przy zlewie, on przechodzi z gazetą |
| W07 | Jestem zmęczona tym, że o wszystkim muszę pamiętać sama. | ona przy biurku wśród list i kalendarza, on czyta w fotelu |
| W08 | Chciałabym, żeby zauważył, ile robię, zanim sama mu o tym powiem. | ona składa pranie, on mija drzwi z kubkiem |
| W09 | Kiedy milknę, to nie znaczy, że jest dobrze. To znaczy, że nie mam już siły tłumaczyć. | ona na brzegu łóżka, on niepewnie w tle |
| W10 | Boję się powiedzieć, czego mi brakuje, bo znowu skończy się kłótnią. | ona przy śniadaniu z ręką na piersi, on z telefonem |

## Dla niego

| Nr | Myśl | Scena |
|---|---|---|
| M01 | Nie wiem, jak jej pomóc, kiedy jest jej źle. Więc doradzam. I widzę, że to nie to. | on bezradny na sofie, ona skulona z chusteczką |
| M02 | Chciałbym usłyszeć, że coś robię dobrze. Nie tylko to, czego znowu nie zrobiłem. | on przy skręconym regale, ona wskazuje kosz na śmieci |
| M03 | Kiedy milczę, to nie dlatego, że mi nie zależy. Po prostu nie wiem, jak to powiedzieć. | on na balkonie o zmierzchu, ona czeka za szybą |
| M04 | Wracam z pracy i potrzebuję 10 minut ciszy. To nie znaczy, że nie chcę z nią być. | on zmęczony na ławce w przedpokoju, ona idzie z opowieścią |
| M05 | Boję się zacząć tę rozmowę, bo nie chcę jej zranić. | on z dwoma kubkami w progu, ona czyta na sofie |
| M06 | Staram się. Tylko chyba nie w tym, na czym jej najbardziej zależy. | on z ciężkimi zakupami, ona zamyślona przy oknie |
| M07 | Brakuje mi tego, jak kiedyś się ze mną śmiała. | on ze wspólnym zdjęciem w ramce, ona przy laptopie |
| M08 | Kiedy słyszę „musimy porozmawiać”, od razu czuję, że coś zawaliłem. | on spięty w fotelu, ona poważna w drzwiach |
| M09 | Chciałbym, żeby powiedziała wprost, czego potrzebuje. Naprawdę nie umiem zgadywać. | on drapie się po głowie, ona odwrócona z założonymi rękami |
| M10 | Też czuję się samotny. Tylko nikt mnie o to nie pyta. | on sam na sofie z kubkiem, ona idzie spać |

Budowanie: `python3 inner.py build W01 M01 …` (w katalogu `film/`; nagrania `tips/in_<nr>.mp3`, zakończenia
`tips/in_endW.mp3` i `tips/in_endM.mp3`, klipy `clips/i<nr>/`).
