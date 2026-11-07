# SMS – kody dostępu do zapisanych odpowiedzi (SMSAPI)

## Do czego służą
- **Zapisz zmiany na później** (materiał online z linku w e-mailu): po wpisaniu choć jednego słowa pojawia się przycisk.
  Osoba podaje numer telefonu i wpisuje 4-cyfrowy kod z SMS-a. Numer zapisuje się przy zapisie na materiał (Panel → Wiedza → Ostatnie zapisy),
  a kontakt w Mailingu dostaje tag **#znumerem**.
- **Powrót z linku w e-mailu**: jeśli ktoś zapisał odpowiedzi z numerem, przed otwarciem widzi „Czy to Twój numer? ••• ••• 123”,
  dostaje SMS z kodem i dopiero po jego wpisaniu widzi odpowiedzi. Na urządzeniu, na którym już był, wchodzi bez kodu.
- Kody: 4 cyfry, ważne 10 minut, maks. 5 prób; w bazie tylko skrót (hash) kodu. Limity wysyłek na adres IP i e-mail.

## Konfiguracja SMSAPI (krok po kroku)
1. Zaloguj się na **ssl.smsapi.pl** (panel SMSAPI).
2. **Pole nadawcy „DUO”**: menu *Wiadomości SMS → Pola nadawcy* (Sender names) → *Dodaj pole nadawcy* → wpisz `DUO` → wyślij do akceptacji.
   Do czasu akceptacji SMS-y nie wyjdą z tą nazwą (SMSAPI odrzuci wysyłkę z niezatwierdzonego pola).
3. **Token API**: menu *Ustawienia API → Tokeny API (OAuth)* → *Generuj token*. Uprawnienia: wystarczy **SMS** (wysyłka). Skopiuj token
   (pokazuje się tylko raz).
4. **Railway** → projekt DUO → usługa aplikacji → zakładka **Variables** → *New Variable*:
   - `SMSAPI_TOKEN` = wklejony token,
   - `SMSAPI_SENDER` = `DUO` (opcjonalnie – to wartość domyślna).
   Zapisz – Railway sam wdroży aplikację ponownie.
5. Sprawdź: otwórz materiał z linku w e-mailu, wpisz słowo, kliknij „Zapisz zmiany na później” i podaj swój numer.

Tokenu nie wklejaj w czacie ani w repozytorium – tylko w zmiennych Railway.

## Bez tokenu
- **DEMO_MODE=true**: SMS nie jest wysyłany, a kod pokazuje się na ekranie z dopiskiem „Tryb demo – SMS nie został wysłany”.
- **Produkcja (DEMO_MODE wyłączony)**: komunikat „Wysyłka SMS nie jest jeszcze skonfigurowana” – nic nie udaje wysyłki.

## Koszt i treść
Jeden kod = jeden SMS (ok. 70–160 znaków). Treść: „DUO: Twój kod … : 1234. Ważny 10 min. Nie podawaj go nikomu.”
