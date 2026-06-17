# FotoBeat Desktop (English)

FotoBeat Desktop is a local‑first application under the FotoBeat.me brand for creating videos from photos and audio without relying on a SaaS backend. The product aims to be local‑first: media import, audio analysis, timeline, export of sequences/MP4 and later full local rendering via FFmpeg.

## Relation to FotoBeat Web/SaaS

FotoBeat Desktop and FotoBeat Web/SaaS are two separate products under one brand:

- `KumatyTomi/FotoBeat` — desktop application and local renderer.
- `KumatyTomi/FotoBeat---saas` — web application, backend, queues, storage, user projects and later payments.

Only contracts, the manifest format, preset naming and brand language should be shared. Runtime code, release pipeline, storage and rendering are separated.

## Desktop assumptions

- local import of photos and audio
- local project engine: autosave, snapshots, import/export `.fotobeat.json`
- audio analysis and beat‑driven timeline
- frame sequence to PNG
- ZIP with frame sequence
- MP4 proof of concept via `ffmpeg.wasm`
- Electron shell
- local render queue saving the manifest/job status to disk
- later native FFmpeg and Windows installer.

## Quick start — renderer desktop

```bash
npm install
npm run dev
```

## Quick start — Electron shell

Terminal 1 (in the root of the repo):

```bash
npm install
npm run dev
```

Terminal 2:

```bash
cd desktop
npm install
npm run dev
```

## Build renderer

```bash
npm run build
npm run preview
```

## Structure

```
src/
  components/     desktop renderer UI
  data/           effect and format presets
  hooks/          project engine, canvas, export, desktop bridge
  utils/          selection, rhythm, render pipeline, project export

desktop/
  src/main.cjs        Electron main process
  src/preload.cjs     secure bridge to the renderer
  src/renderQueue.cjs local render jobs and workspace on disk

docs/             product and technical decisions
public/assets/    backgrounds, icons, samples and static assets
```

## Status

This repository is now treated as **FotoBeat Desktop** rather than the web/SaaS product. The web product is developed in `KumatyTomi/FotoBeat---saas`.

## Current stage of work

The next stage is to achieve a standalone local‑first MVP:

1. separate the UI language from SaaS
2. consolidate the desktop manifest format
3. save the render job workspace on disk
4. add `render-plan.json` for FFmpeg
5. deliver a real local MP4.
