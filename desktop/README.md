# FotoBeat.me Desktop

Desktop wrapper dla FotoBeat.me. Ten moduł pozwala uruchomić istniejący frontend Vite jako aplikację desktopową i przygotowuje most pod lokalny render.

## Status

Aktualnie to scaffold Electron z pierwszym zapisem jobów na dysk:

- main process,
- preload bridge,
- wybór folderu eksportu,
- lokalna kolejka renderu,
- zapis manifestu do folderu joba,
- zapis statusu joba do JSON,
- mock output w miejscu przyszłego MP4,
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
window.fotobeatDesktop.pickOutputFolder()
window.fotobeatDesktop.createLocalRenderJob({ manifest, outputFolder })
window.fotobeatDesktop.getLocalRenderJob(jobId)
```

## Struktura joba na dysku

Po kliknięciu `Render lokalny` desktop tworzy folder:

```text
<outputFolder>/local-render-<uuid>/
  manifest.fotobeat.json
  render-job.json
  fotobeat-local-render-<uuid>.mp4
```

Na tym etapie plik `.mp4` jest placeholderem tekstowym. Ma tylko rezerwować docelową ścieżkę i potwierdzić działający zapis na dysk.

## Flow desktop UI

Web UI wykrywa desktop przez:

```js
Boolean(window.fotobeatDesktop)
```

Panel `Desktop render` obsługuje:

- wybór folderu eksportu,
- utworzenie lokalnego joba,
- polling `getLocalRenderJob(jobId)`,
- status, progress, logi i `outputPath`.

## Następny krok

Zastąpić placeholder outputu realnym etapem przygotowania plików pod FFmpeg:

```text
manifest JSON
→ resolve local files / frame sequence
→ build ffmpeg command plan
→ write render-plan.json
→ później ffmpeg encode MP4
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
