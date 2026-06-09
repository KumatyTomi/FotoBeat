# FotoBeat.me Desktop

Desktop wrapper dla FotoBeat.me. Ten moduł pozwala uruchomić istniejący frontend Vite jako aplikację desktopową i przygotowuje most pod lokalny render.

## Status

Aktualnie to scaffold Electron:

- main process,
- preload bridge,
- wybór folderu eksportu,
- mock lokalnej kolejki renderu,
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

## Następny krok

Dodać w web UI detekcję desktopu:

```js
const isDesktop = Boolean(window.fotobeatDesktop);
```

Następnie w panelu exportu pokazać:

- wybór folderu eksportu,
- przycisk `Render lokalny`,
- polling `getLocalRenderJob(jobId)`,
- status i `outputPath`.

## Późniejszy render właściwy

Docelowo mock `renderQueue.cjs` powinien zostać wymieniony na lokalny pipeline:

```text
manifest JSON
→ resolve local files
→ normalize images
→ generate frames/transitions
→ ffmpeg encode MP4
→ save outputPath
```
