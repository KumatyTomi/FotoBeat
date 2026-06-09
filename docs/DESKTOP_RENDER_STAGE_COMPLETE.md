# FotoBeat Desktop Render Stage — complete

## Stage status

This stage is closed as a usable desktop render foundation.

The implementation now supports a local-first desktop render flow:

```text
React timeline / canvas
→ PNG frame sequence in browser storage
→ Desktop MP4 action
→ Electron IPC
→ job workspace on disk
→ frames/frame_0001.png ...
→ render-plan.json
→ native FFmpeg encode
→ .mp4.partial
→ promoted .mp4
→ sidecar .mp4.json
→ persistent render-history.json
→ UI history with file/folder actions
```

## Completed scope

### Desktop runtime

- Electron main/preload bridge for desktop-only actions.
- FFmpeg doctor and local FFmpeg availability check.
- Local output folder picker.
- Render job workspace creation.
- Collision-safe output paths.
- Partial-output workflow using `.mp4.partial`.
- Promotion from partial output to final `.mp4` after successful encode.
- Cleanup of partial output on failure.

### Render planning

- `render-plan.json` schema for desktop renderer.
- Frame-sequence input mode.
- FFmpeg command planning for PNG sequence input.
- Output metadata including final path and temp path.
- Validation of render plan and first frame.

### Native FFmpeg renderer

- Native FFmpeg process spawning.
- Progress parsing from FFmpeg stderr.
- Validation before encoding.
- Output inspection after encode.
- Result object with FFmpeg binary, exit code and output stats.

### Browser-to-desktop bridge

- Browser PNG frame blobs are converted to `ArrayBuffer`.
- Frame payload is sent over Electron IPC.
- Desktop job writes PNGs to `frames/frame_0001.png`, `frame_0002.png`, etc.
- IPC limits protect the app from oversized frame transfers.

### Job metadata and audit trail

- `manifest.fotobeat.json` per job.
- `render-plan.json` per job.
- `render-job.json` per job.
- `frames/frames-manifest.json` per imported sequence.
- `.mp4.json` sidecar with mode, native readiness, frame import and native result.
- Persistent history at `~/.fotobeat-desktop/render-history.json`.

### UI

- Desktop render panel extracted into `DesktopRenderPanel.jsx`.
- Desktop render history extracted into `DesktopRenderHistory.jsx`.
- Dedicated desktop render stylesheet.
- Current job status shows mode and logs.
- Persistent render history is visible in the UI.
- Actions added:
  - refresh FFmpeg status
  - choose output folder
  - create local render job
  - create Desktop MP4 from frame sequence
  - refresh render history
  - clear render history
  - show final MP4 in folder
  - open job folder

## Current product behavior

The user-facing flow is now:

```text
1. Add images and audio.
2. Build/preview timeline.
3. Render PNG frame sequence.
4. Click Desktop MP4.
5. Desktop imports the frame sequence into a job workspace.
6. Native FFmpeg encodes the MP4.
7. The output appears in the desktop render panel and persistent history.
8. User can open the MP4 location or the full job folder.
```

## Known limitations left for later stages

- Audio muxing from the uploaded browser audio file is not fully wired into the native desktop FFmpeg job yet.
- Frame transfer currently uses IPC payload limits; larger sequences should later use a streaming/chunked protocol or file-backed handoff.
- Render jobs are not cancelable once native FFmpeg has started.
- There is no retry button yet for failed history entries.
- There is no packaged Windows installer workflow finalized in this stage.
- There is no automated integration test that runs a real FFmpeg render fixture.

## Recommended next stage

Next stage should be:

```text
Desktop Render v2 — audio, cancellation, retry and packaging
```

Suggested order:

1. Add audio import into desktop job workspace.
2. Update render plan to reference real audio input.
3. Add FFmpeg audio muxing with `-shortest` and AAC output.
4. Add cancel support for running FFmpeg process.
5. Add retry action from render history.
6. Add fixture-based smoke test for native FFmpeg output.
7. Add Windows packaging notes and release workflow.

## Stage close marker

This document marks the desktop render foundation stage as complete.
