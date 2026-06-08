# Work log

## 2026-06-08 — Render queue/status panel

Commits wykonane w tym etapie:

- `e1bbc04` — hook `useCanvasRecorder` dostał historię eksportów WebM, metadane plików, usuwanie i czyszczenie historii.
- `df0fa65` — aplikacja dostała UI render queue: lista eksportów, pobieranie każdego WebM, usuwanie i czyszczenie historii.
- `8fcf83b` — style dla historii renderów, metadanych i akcji pobierz/usuń.
- `ec1eaa0` — roadmapa oznacza render queue jako wykonany etap.

## Zakres funkcjonalny

- Każdy eksport WebM trafia do `exportHistory`.
- Historia trzyma: ID, datę, nazwę pliku, URL pobierania, MIME, czas, rozmiar i informację audio/video.
- Można pobrać dowolny wcześniejszy eksport z aktualnej sesji.
- Można usunąć pojedynczy eksport.
- Można wyczyścić całą historię.
- Hook czyści `objectURL`, żeby ograniczać wycieki pamięci.
- UI render queue jest przygotowany pod późniejszy backend, IndexedDB albo ffmpeg.wasm.

## Uwaga techniczna

Historia eksportów jest na razie sesyjna. Po odświeżeniu strony linki do WebM znikną, bo wskazują na tymczasowe `objectURL`. Persistent render history wymaga zapisu plików w IndexedDB albo backend/storage.

## Następny rekomendowany etap

Persistent render history albo ffmpeg.wasm proof of concept. Przed MP4 najlepiej dodać IndexedDB dla plików WebM lub zdecydować, że eksporty są tylko jednorazowe do pobrania.
