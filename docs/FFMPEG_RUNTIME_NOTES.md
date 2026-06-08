# FotoBeat.me — ffmpeg.wasm runtime notes

## Co zostało dodane

Ten etap stabilizuje runtime pod ffmpeg.wasm i przygotowuje MP4 z opcjonalnym audio.

## Elementy techniczne

- `src/utils/ffmpegCoreConfig.js` — konfiguracja ładowania ffmpeg core przez `toBlobURL`.
- `src/hooks/useMp4Exporter.js` — obsługa MP4 z klatek PNG, opcjonalnie z audio.
- `vite.config.js` — nagłówki COOP/COEP dla Vite dev/preview.
- `src/components/AppBoundary.jsx` — zabezpieczenie UI przed pustą stroną po crashu.
- `src/hooks/useStorageHealth.js` — hook do diagnostyki użycia storage przeglądarki.

## Dlaczego COOP/COEP

ffmpeg.wasm i WebAssembly w przeglądarce mogą wymagać izolacji cross-origin, szczególnie gdy używane są warianty wykorzystujące worker albo SharedArrayBuffer. Vite dev/preview dostały nagłówki:

```txt
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Obecny zakres MP4

- MP4 bez audio: działa jako POC z sekwencji PNG.
- MP4 z audio: exporter potrafi przekazać `audio.input` do ffmpeg i użyć komendy z AAC.
- Produkcyjny eksport 1080p/30fps nie jest jeszcze celem tego etapu.

## Ograniczenia

- `@ffmpeg/core` jest pobierany z CDN przez `toBlobURL`.
- Deployment produkcyjny może wymagać hostowania core lokalnie.
- Browser memory nadal jest głównym ograniczeniem.
- Długie materiały powinny być renderowane segmentami.

## Następny etap

Podpiąć UI dla eksportu MP4 z audio i sprawdzić synchronizację audio/video na krótkim materiale.
