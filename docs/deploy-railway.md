# Wdrożenie na Railway

Zestaw: usługa **Postgres** + usługa **duotherapy** (z repozytorium GitHub). Railway buduje obraz z `Dockerfile` (z Chromium do PDF) według `railway.json`; przy każdym starcie kontenera uruchamia `npm run db:deploy` (migracje + szablony kwestionariuszy, a w trybie DEMO także dane demonstracyjne – idempotentnie).

## Dlaczego dwa adresy bazy

Postgres na Railway udostępnia konto superużytkownika, a superużytkownik **omija RLS**. Dlatego:

- `DATABASE_OWNER_URL` – konto Railway (superużytkownik) – tylko migracje;
- `DATABASE_URL` – rola `duo_app` (bez superużytkownika, bez BYPASSRLS) – aplikacja. Rolę tworzy automatycznie `db:deploy` z hasłem wziętym z tego adresu.

## Zmienne usługi `duotherapy` (Variables → Raw Editor)

```
DATABASE_OWNER_URL=${{Postgres.DATABASE_URL}}
DATABASE_URL=postgresql://duo_app:${{DUO_APP_DB_PASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DUO_APP_DB_PASSWORD=<losowe, min. 16 znaków – np. openssl rand -hex 24>
DATA_ENCRYPTION_KEY=<openssl rand -base64 32>
TOKEN_SECRET=<openssl rand -base64 32>
DEMO_MODE=true
REQUIRE_MFA=false
PORT=3000
```

`PORT=3000` musi zgadzać się z portem ustawionym przy domenie (*Settings → Networking → Port 3000*). Puste `DUO_APP_DB_PASSWORD`, `DATA_ENCRYPTION_KEY` lub `TOKEN_SECRET` zatrzymają wdrożenie z czytelnym komunikatem w *Deploy Logs*.

- `APP_URL` jest opcjonalne – bez niego aplikacja użyje domeny Railway (`RAILWAY_PUBLIC_DOMAIN`). Ustaw je przy własnej domenie, np. `https://duo.twojadomena.pl`.
- **`DATA_ENCRYPTION_KEY` nie zmieniaj po zapisaniu danych** – utrata/zmiana klucza uniemożliwia odczyt odpowiedzi, notatek i podsumowań. Zachowaj kopię w menedżerze haseł.
- Wolumen `duotherapy-volume` nie jest potrzebny (aplikacja nie zapisuje plików na dysku) – można go usunąć.
- Usługa potrzebuje publicznej domeny: *Settings → Networking → Generate Domain*.

## Diagnostyka

Otwórz `https://<domena>/api/health` – pokazuje stan konfiguracji, połączenia z bazą (rola `duo_app`), migracji i szablonów, bez sekretów. Szczegóły błędów: *Deployments → View logs*.

## Tryb DEMO → produkcja

Na początek `DEMO_MODE=true`: baner „DEMO”, konta `admin@demo.duo` / `psycholog@demo.duo` (hasło `demo-duo-2026!`, albo `DEMO_PASSWORD`), dane wyłącznie syntetyczne. **Nie wprowadzaj prawdziwych danych w trybie DEMO** – hasła demo są publiczne w repozytorium.

Przed pracą z prawdziwymi klientami (po liście `docs/production-readiness.md`):

1. Nowa, czysta baza (lub usunięcie danych demo), `DEMO_MODE=false`, `REQUIRE_MFA=true`.
2. Utwórz administratora (Railway → usługa → *Shell*, lub `railway run`):
   ```bash
   npm run user:create -- admin twoj@email.pl "Imię Nazwisko"
   ```
3. Zaloguj się, skonfiguruj MFA, uzupełnij i zatwierdź teksty prawne w *Ustawieniach*.
