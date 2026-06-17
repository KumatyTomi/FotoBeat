# FotoBeat.me Desktop

Desktop wrapper dla FotoBeat.me. Ten moduł uruchamia frontend Vite jako aplikację desktopową i obsługuje lokalny eksport MP4 przez FFmpeg, gdy job zawiera zaimportowaną sekwencję PNG.

## Status

Aktualnie moduł desktop ma pierwszy działający pipeline pod natywny render:

- main process,
- preload bridge,
- FFmpeg doctor,
- wybór folderu eksportu,
- lokalna kolejka renderu,
- import klatek PNG do folderu joba,
- opcjonalny import audio do folderu joba,
- zapis manifestu do folderu joba,
- zapis `render-plan.json`,
- zapis statusu joba do JSON,
- output sidecar JSON,
- realny natywny FFmpeg dla jobów z sekwencją `frames/frame_0001.png`,
- placeholder output tylko jako fallback, gdy job nie ma gotowych klatek,
- historia renderów i akcje otwierania outputu,
- tryb dev przez `http://localhost:5173`,
- tryb build przez `dist/` z web frontendu.

## Uruchomienie w dev

Terminal 1, z katalogu głównego repo:

```bash
npm install
npm run dev
```

Terminal 2:

```bash
cd desktop
npm install
npm run dev
```

## API dostępne w rendererze

```js
window.fotobeatDesktop.getVersion()
window.fotobeatDesktop.getFfmpegStatus()
window.fotobeatDesktop.pickOutputFolder()
window.fotobeatDesktop.createLocalRenderJob({ manifest, outputFolder, frames, audioFile })
window.fotobeatDesktop.getLocalRenderJob(jobId)
window.fotobeatDesktop.cancelLocalRenderJob(jobId)
window.fotobeatDesktop.retryLocalRenderJob(jobId)
window.fotobeatDesktop.listRenderHistory(limit)
```

## Struktura joba na dysku

Po kliknięciu `Desktop MP4` desktop tworzy folder:

```text
<outputFolder>/local-render-<uuid>/
  manifest.fotobeat.json
  render-plan.json
  render-job.json
  frames/
    frame_0001.png
    frame_0002.png
  audio/
    input-audio
    audio-manifest.json
  fotobeat-local-render-<uuid>.mp4.partial
  fotobeat-local-render-<uuid>.mp4
  fotobeat-local-render-<uuid>.mp4.json
```

Plik `.partial` jest promowany do finalnego `.mp4` dopiero po udanym zakończeniu FFmpeg. Jeśli job nie ma zaimportowanej sekwencji PNG, desktop zapisuje placeholder tekstowy, żeby zachować diagnostykę ścieżek i sidecar.

## FFmpeg doctor

Desktop sprawdza FFmpeg przez:

```js
window.fotobeatDesktop.getFfmpegStatus()
```

Obsługiwane źródła:

```text
FOTOBEAT_FFMPEG_PATH
resources/ffmpeg/ffmpeg(.exe)
ffmpeg z PATH
```

## Native FFmpeg renderer

Moduł:

```text
desktop/src/nativeFfmpegRenderer.cjs
```

Aktualny zakres:

- ładuje `render-plan.json`,
- waliduje `schemaVersion`,
- waliduje `inputMode: frame-sequence`,
- sprawdza pierwszy plik `frames/frame_0001.png`,
- sprawdza wymagane audio, jeśli zostało zaimportowane,
- rozwiązuje ścieżki względne względem folderu joba,
- uruchamia `ffmpeg` przez `spawn`,
- parsuje postęp z `time=HH:MM:SS.xx`,
- zapisuje wynik `fotobeat.desktop.native-render-result.v1`,
- pozwala kolejce promować `.partial` do finalnego `.mp4` po sukcesie.

## Flow desktop UI

Web UI wykrywa desktop przez:

```js
Boolean(window.fotobeatDesktop)
```

Panel `Desktop render` obsługuje:

- diagnostykę FFmpeg,
- wybór folderu eksportu,
- wybór profilu MP4,
- utworzenie lokalnego joba,
- polling `getLocalRenderJob(jobId)`,
- cancel/retry,
- status, progress, logi i `outputPath`,
- historię renderów oraz akcje pokaż/otwórz.

## Następne kroki

Najbliższe prace produkcyjne:

- streaming lub chunking klatek przez desktop bridge, żeby zdjąć obecny limit IPC dla dłuższych sekwencji,
- próbki QA 9:16, 16:9 i 1:1 renderowane przez natywny FFmpeg,
- instalator Windows z dołączonym albo wykrywalnym FFmpeg,
- spójne kontrakty dla przyszłego SaaS render workera.
