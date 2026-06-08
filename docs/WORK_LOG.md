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

## 2026-06-08 — Persistent render history in IndexedDB

Commits wykonane w tym etapie:

- `cfbc492` — dodany storage layer `src/utils/renderStorage.js` oparty o IndexedDB.
- `8dfc671` — recorder zapisuje WebM Blob w IndexedDB i odtwarza historię po odświeżeniu.
- `2f22749` — ESLint dostał global `indexedDB`.
- `7b52d7c` — render queue pokazuje, czy eksport jest zapisany lokalnie, czy tylko sesyjny.
- `1408868` — roadmapa oznacza persistent render history jako wykonany etap.

## Zakres funkcjonalny

- Eksporty WebM są zapisywane jako `Blob` w IndexedDB.
- Po odświeżeniu strony hook odczytuje zapisane eksporty i tworzy nowe `objectURL` do pobrania.
- Historia renderów jest limitowana do 10 elementów.
- Starsze eksporty są przycinane przez `pruneRenderExports`.
- Usunięcie pojedynczego eksportu czyści UI, `objectURL` i rekord w IndexedDB.
- Czyszczenie historii usuwa wszystkie rekordy z IndexedDB.
- UI pokazuje status: `zapisane lokalnie` albo `sesyjne`.

## Następny rekomendowany etap

ffmpeg.wasm proof of concept albo poprawa jakości beat engine: realniejsza detekcja transientów, scoring ostrości zdjęć i przygotowanie MP4 9:16 / 16:9.
