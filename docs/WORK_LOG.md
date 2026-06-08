# Work log

## 2026-06-08 — ffmpeg.wasm MP4 proof of concept

Commits wykonane w tym etapie:

- `4e8a6b3` — dodane zależności `@ffmpeg/ffmpeg` i `@ffmpeg/util`.
- `48f9543` — dodany IndexedDB storage dla eksportów MP4.
- `6b057c5` — dodany hook `useMp4Exporter` z lazy-load ffmpeg.wasm, virtual FS i MP4 Blob.
- `8f5b6c0` — hook MP4 exporter utwardzony pod lint i object URL cleanup.
- `7587b25` — UI dostało `Eksport MP4 POC`, progress, historię MP4 i pobieranie.
- `4a36d23` — roadmapa oznacza ffmpeg.wasm MP4 POC jako wykonany.

## Zakres funkcjonalny

- ffmpeg.wasm jest ładowany dynamicznie dopiero po kliknięciu eksportu MP4.
- Eksport używa zapisanej sekwencji PNG z IndexedDB.
- Klatki trafiają do virtual FS jako `frames/frame_0001.png`, `frames/frame_0002.png` itd.
- Aplikacja uruchamia przygotowaną komendę PNG sequence -> MP4 bez audio.
- Wynik jest odczytywany jako `fotobeat-output.mp4`.
- MP4 trafia do IndexedDB jako Blob.
- UI pokazuje progress loading/preparing/encoding.
- UI pozwala pobrać lokalny MP4 i usuwać eksporty z historii.

## Ograniczenia

- POC eksportuje MP4 bez audio.
- ffmpeg.wasm może być ciężki i wolny w przeglądarce.
- Obecny frame sequence limit 5s @ 12fps jest celowy, żeby ograniczyć ryzyko pamięci.

## Następny rekomendowany etap

MP4 audio mux: dodać wejście audio do ffmpeg.wasm, przyciąć audio do długości renderu, dodać AAC i sprawdzić synchronizację audio/video.
