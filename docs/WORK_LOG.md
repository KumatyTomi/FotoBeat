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

## Następny rekomendowany etap

Media pipeline:

1. Utworzyć obiekty URL dla wrzuconych zdjęć.
2. Wygenerować miniatury i metadane orientacji.
3. Rysować aktualne zdjęcie na canvas zamiast placeholdera.
4. Dodać ręczną selekcję zdjęć do timeline.
5. Dopiero potem zrobić eksport MP4 / ffmpeg.wasm proof of concept.
