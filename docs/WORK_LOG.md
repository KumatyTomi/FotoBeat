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

## Następny rekomendowany etap

Render preview canvas:

1. Canvas 2D w komponencie podglądu.
2. Rysowanie aktualnego klipu z timeline.
3. Animacje zgodne z presetem: zoom, fade, shake, glitch.
4. Synchronizacja pod `timeline.clips[].start` i `duration`.
5. Przygotowanie pod późniejszy eksport MP4.
