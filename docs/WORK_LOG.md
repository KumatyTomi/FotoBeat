# Work log

## 2026-06-08 — Frame sequence renderer to IndexedDB

Commits wykonane w tym etapie:

- `44713d6` — dodany `frameSequenceStorage.js` z IndexedDB dla sekwencji PNG.
- `751c145` — dodany `useFrameSequenceRenderer` z renderem klatek, progress, cancel i zapisem do IndexedDB.
- `1a6a4d3` — UI dostało panel Frame sequence, listę sekwencji i usuwanie.
- `9842fea` — style dla progress baru, statusów i listy sekwencji.
- `69d7d36` — roadmapa oznacza frame sequence renderer jako wykonany.
- `bf8c967` — masterplan 100 etapów zaktualizowany po frame sequence renderer.

## Zakres funkcjonalny

- Aplikacja potrafi wygenerować sekwencję klatek PNG z `renderFrameAtTime`.
- Sekwencja jest zapisywana jako tablica PNG Blobów w IndexedDB.
- Render ma limit bezpieczeństwa: maksymalnie 5 sekund i 12 fps.
- UI pokazuje progress renderu.
- Render można przerwać przez cancel.
- Historia sekwencji jest wczytywana po refreshu.
- Można usunąć pojedynczą sekwencję lub wyczyścić całą historię sekwencji.
- Ten etap przygotowuje bezpośrednie wejście pod ffmpeg.wasm.

## Ograniczenia

- Brak jeszcze pobierania ZIP z klatkami.
- Brak jeszcze ffmpeg.wasm.
- Limit 5s @ 12fps jest celowy, żeby nie przeciążyć pamięci przeglądarki.

## Następny rekomendowany etap

Frame sequence ZIP export: odczytać zapisaną sekwencję PNG z IndexedDB, przygotować paczkę klatek albo manifest nazw `frame_0001.png`, a następnie wejść w ffmpeg.wasm proof of concept.
