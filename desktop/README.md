# FotoBeat.me Desktop

Desktop wrapper dla FotoBeat.me. Ten moduł pozwala uruchomić istniejący frontend Vite jako aplikację desktopową i przygotowuje most pod lokalny render.

## Status

Aktualnie to scaffold Electron z pierwszym pipeline pod natywny render:

- main process,
- preload bridge,
- FFmpeg doctor,
- wybór folderu eksportu,
- lokalna kolejka renderu,
- zapis manifestu do folderu joba,
- zapis `render-plan.json`,
- zapis statusu joba do JSON,
- output sidecar JSON,
- mock output w miejscu przyszłego MP4,
- izolowany moduł native FFmpeg renderer,
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
window.fotobeatDesktop.createLocalRenderJob({ manifest, outputFolder })
window.fotobeatDesktop.getLocalRenderJob(jobId)
```

## Struktura joba na dysku

Po kliknięciu `Render lokalny` desktop tworzy folder:

```text
<outputFolder>/local-render-<uuid>/
  manifest.fotobeat.json
  render-plan.json
  render-job.json
  fotobeat-local-render-<uuid>.mp4
  fotobeat-local-render-<uuid>.mp4.json
```

Na tym etapie plik `.mp4` jest placeholderem tekstowym. Ma rezerwować docelową ścieżkę, potwierdzić działający zapis na dysk i przygotować miejsce dla natywnego FFmpeg.

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
- waliduje schemaVersion,
- waliduje `inputMode: frame-sequence`,
- sprawdza pierwszy plik `frames/frame_0001.png`,
- rozwiązuje ścieżki względne względem folderu joba,
- uruchamia `ffmpeg` przez `spawn`,
- parsuje postęp z `time=HH:MM:SS.xx`,
- zwraca `fotobeat.desktop.native-render-result.v1`.

Na razie moduł jest izolowany. `renderQueue.cjs` nadal używa placeholder outputu, dopóki nie dodamy realnego przepięcia kolejki na native renderer.

## Flow desktop UI

Web UI wykrywa desktop przez:

```js
Boolean(window.fotobeatDesktop)
```

Panel `Desktop render` obsługuje:

- diagnostykę FFmpeg,
- wybór folderu eksportu,
- utworzenie lokalnego joba,
- polling `getLocalRenderJob(jobId)`,
- status, progress, logi i `outputPath`.

## Następny krok

Przepiąć `renderQueue.cjs`, żeby dla jobów z gotową sekwencją PNG wykonywał:

```text
render-plan.json
→ validateRenderPlan()
→ runNativeFfmpegRender()
→ inspect output
→ write sidecar
```

## Późniejszy render właściwy

Docelowo `renderQueue.cjs` powinien przejść na lokalny pipeline:

```text
manifest JSON
→ resolve local files
→ normalize images
→ generate frames/transitions
→ ffmpeg encode MP4
→ save outputPath
```
