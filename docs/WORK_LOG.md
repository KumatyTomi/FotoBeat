# Work log

## 2026-06-08 — ffmpeg runtime stability + MP4 audio foundation batch

Commits wykonane w tym etapie:

- `338f47d` — dodany `ffmpegCoreConfig.js` z konfiguracją ładowania core przez `toBlobURL`.
- `5375f6f` — `mp4ExportPlan.js` obsługuje wariant MP4 z audio i bez audio.
- `1210a3a` — `useMp4Exporter` dostał opcjonalny audio mux: `audio.input`, AAC i cleanup audio z virtual FS.
- `3ecf5bf` — dodany `useStorageHealth`.
- `782ae8a` — dodany `AppBoundary` jako safety boundary dla UI.
- `738c163` — aplikacja została owinięta w `AppBoundary`.
- `7983f18` — dodany `vite.config.js` z nagłówkami COOP/COEP.
- `8f6b67a` — dodane `docs/FFMPEG_RUNTIME_NOTES.md`.
- `0cd1392` — roadmapa zaktualizowana po batchu stabilizacji ffmpeg runtime.

## Zakres funkcjonalny

- ffmpeg core ma jawny runtime config i używa `toBlobURL`.
- Vite dev/preview ma nagłówki `Cross-Origin-Opener-Policy` i `Cross-Origin-Embedder-Policy`.
- MP4 exporter potrafi przyjąć opcjonalny plik audio, zapisać go jako `audio.input` i uruchomić komendę z AAC.
- MP4 export plan rozróżnia wariant bez audio i z audio.
- Dodano hook diagnostyki storage przeglądarki.
- Dodano safety boundary, żeby crash UI nie zostawiał pustej strony.
- Dodano dokument runtime notes dla ffmpeg.wasm.

## Ograniczenia

- UI dla MP4 audio mux nie jest jeszcze podpięte, choć warstwa eksportera już to obsługuje.
- Produkcyjny eksport 1080p/30fps nadal wymaga ostrożnego zwiększania limitów.
- Deployment produkcyjny może wymagać lokalnego hostowania ffmpeg core zamiast CDN.

## Następny rekomendowany etap

Podpiąć UI dla MP4 audio mux i przetestować synchronizację audio/video na krótkim materiale.
