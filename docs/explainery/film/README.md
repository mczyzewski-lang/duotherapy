# Film „Mgła” (9:16, hook H1) – źródła montażu

- `shots.json` – opisy 13 kadrów (styl i strefy bezpieczne są w promptach w projekcie ElevenLabs „DUO – explainer »Mgła« – produkcja (H1)”).
- `timeline.json` – czasy segmentów lektora, napisów i kadrów.
- `film.html` – animacja na canvasie 1080×1920 (ruch kamery, mgła, napisy, plansza z logo). Strefy bezpieczne Reels:
  góra 270 px, dół 480 px, lewa 90 px, prawa 180 px.
- `render.js` – renderuje klatki przez Playwright (`node render.js frames 0 2304`), potem `ffmpeg` składa je z lektorem.

Do odtworzenia potrzebne są obok: kadry `s01.png`–`s13.png`, segmenty lektora `v01.mp3`–`v11.mp3` (głos ElevenLabs
`OtIWAuy1FmuND2I8ifh5`, model v3) i katalog `fonts/` z czcionkami Inter i Fraunces z `node_modules/@fontsource-variable`.

Podmiana hooka: nowy `v01.mp3` + tekst tytułu w `film.html` (sekcja „hook”) + przeliczenie `timeline.json`.
