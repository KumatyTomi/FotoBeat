# Work log

## 2026-06-07 — Project engine stage

Commits wykonane w tym etapie:

- `148a096` — dodany work log i potwierdzenie zapisu do repo.
- `8eb0b8d` — README opisuje aktywny etap `project-engine`.
- `08cd3d5` — rozbudowane formaty eksportu i presety efektów.
- `04ffd50` — timeline dostał beat grid, sekcje intro/build/drop/outro i energię klipów.
- `ac85265` — podgląd timeline pokazuje metadane, czas, sekcje i pasek energii.
- `1959bb9` — dodany panel projektu: autosave, snapshoty, eksport JSON do schowka oraz analiza audio.
- `c9f004b` — style dla panelu projektu, audio engine i timeline.
- `02caf0d` — roadmapa zaktualizowana po etapie project-engine.

## Zakres funkcjonalny

- Projekt ma nazwę i notatki.
- Stan projektu zapisuje się w `localStorage`.
- Snapshoty zapisują wariant timeline.
- Eksport projektu jako JSON kopiuje payload do schowka.
- Audio jest dekodowane w przeglądarce przez Web Audio API.
- Aplikacja szacuje energię i BPM.
- Timeline dostaje beat mapę, sekcje i warianty efektów.

## Świadome ograniczenia

- Eksport JSON jest teraz do schowka, nie do pliku. To bezpieczny wariant bez helpera pobierania.
- BPM jest heurystyką na bazie energii, jeszcze nie realną detekcją transientów.
- Snapshoty nie przechowują binarnych plików zdjęć/audio, tylko stan montażu.
- Import JSON jest zaplanowany jako następny mniejszy krok.

## 2026-06-07 — Render preview canvas stage

Commits wykonane w tym etapie:

- `4e772ed` — dodany animowany canvas render preview w `App.jsx`.
- `ef220ab` — dodane style `src/render-preview.css`.
- `c1e0971` — import stylów render preview w `main.jsx`.
- `b0b400a` — roadmapa oznacza canvas preview jako wykonany etap.

## Zakres funkcjonalny

- Canvas działa w formatach 16:9, 9:16 i 1:1.
- Preview używa aktualnego timeline, presetu, energii klipu i sekcji timeline.
- `requestAnimationFrame` animuje podgląd bez eksportu MP4.
- HUD pokazuje rozdzielczość, czas i numer aktualnego klipu.
- Presety mają własne palety, rotacje, glow i scanlines.
- Preview rysuje placeholdery kadrów, dopóki media pipeline nie przygotuje miniatur zdjęć.

## 2026-06-07 — Media pipeline stage

Commits wykonane w tym etapie:

- `b90232c` — dodany media pipeline, object URL-e, ładowanie obrazów, orientacja i `drawImage` na canvas.
- `35a7a9f` — dodane style galerii mediów i kart miniatur.
- `e5aff4b` — roadmapa oznacza media pipeline jako wykonany etap.

## Zakres funkcjonalny

- Upload zdjęć tworzy listę `mediaAssets`.
- Każdy asset ma ID, nazwę, rozmiar, typ, URL, status, wymiary, orientację i obiekt `Image`.
- Aplikacja czyści `objectURL` w cleanupie efektu React.
- Galeria pokazuje miniatury zdjęć, status ładowania, orientację i rozdzielczość.
- Użytkownik może ręcznie wybrać aktywne kadry do timeline.
- Timeline i canvas używają tylko aktywnych kadrów.
- Canvas rysuje prawdziwe zdjęcie przez `drawImage`, z kadrowaniem cover.
- Eksport JSON zawiera podsumowanie aktywnych mediów bez binarnych danych.

## 2026-06-07 — Timeline control stage

Commits wykonane w tym etapie:

- `3a3c5c5` — ręczna kolejność aktywnych kadrów, przypinanie zdjęć do klipów, scoring mediów i eksport decyzji do JSON.
- `a84dfd6` — style kart timeline control, badge score i przyciski góra/dół/przypnij.
- `ddd3e71` — roadmapa oznacza timeline control jako wykonany etap.

## Zakres funkcjonalny

- Aktywne kadry mają własną kolejność w `selectedAssetIds`.
- Karty mediów mają przyciski góra/dół do ręcznego sortowania timeline.
- Można przypiąć wybrane zdjęcie do aktualnego klipu render preview.
- Można odpiąć zdjęcie od aktualnego klipu.
- Canvas respektuje przypięcia przed automatyczną kolejnością.
- Scoring zdjęcia uwzględnia status, rozdzielczość, zgodność orientacji z formatem i rozmiar pliku.
- Eksport JSON zawiera kolejność kadrów, przypięcia oraz score aktywnych zdjęć.

## 2026-06-07 — Project import/export upgrade

Commits wykonane w tym etapie:

- `ea9d796` — import `.fotobeat.json`, eksport jako plik, remap mediów po ID/nazwie i status importu.
- `b95e334` — style kontrolek importu/eksportu oraz statusów IO.
- `fe726c0` — roadmapa oznacza import/export jako wykonany etap.

## Zakres funkcjonalny

- Eksport projektu działa jako normalny link `download` do pliku `.fotobeat.json`.
- Kopiowanie JSON do schowka zostało zachowane jako szybka opcja debugowa.
- Import projektu działa przez input pliku JSON.
- Import waliduje schemat `fotobeat.project.v1`.
- Import odtwarza ustawienia projektu, kolejność kadrów i przypięcia.
- Media po imporcie są mapowane do aktualnie wrzuconych zdjęć po ID albo nazwie pliku.
- UI pokazuje status sukcesu lub błąd importu.

## Następny rekomendowany etap

Waveform + beat upgrade:

1. Narysować waveform audio.
2. Pokazać beat grid na osi czasu.
3. Dodać ręczną korektę długości klipów.
4. Przygotować pierwsze ffmpeg.wasm proof of concept eksportu MP4.
