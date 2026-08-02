# FotoBeat Desktop Render v2 — stage complete

## Stage status

This stage is closed as a single atomic commit.

It advances the desktop renderer from a video-only FFmpeg foundation into a more practical render worker with audio-aware planning, cancel support and in-session retry support.

## Completed scope

### Audio handoff and AAC mux planning

- Desktop jobs can now import binary audio payloads into the job workspace.
- Imported audio is written to:

```text
audio/input-audio
audio/audio-manifest.json
```

- `render-plan.json` now marks audio as imported when a binary input exists.
- Native FFmpeg command generation muxes imported audio with AAC output.
- Audio metadata without an imported binary remains video-only and is reported as such in plan notes/warnings.

### Native FFmpeg cancellation foundation

- Native FFmpeg process spawning now exposes the child process through `onSpawn`.
- The render queue tracks running FFmpeg child processes by job id.
- Active renders can be canceled via Electron IPC.
- Cancel cleans up partial output and writes final job/sidecar/history status as `canceled`.

### Retry foundation

- In-session jobs can be retried after `failed`, `canceled` or `done` status.
- Retry resets progress, status, native result and partial output.
- Retry rebuilds `render-plan.json` before scheduling the job again.
- Retry is intentionally limited to jobs still loaded in memory; persisted-history retry will need workspace rehydration later.

### IPC and preload bridge

Electron main/preload now expose:

```text
cancelLocalRenderJob(jobId)
retryLocalRenderJob(jobId)
```

### Render plan validation

- Required imported audio paths are validated before FFmpeg starts.
- Missing imported audio is treated as a hard validation error.
- Metadata-only audio is treated as a warning and renders video-only.

## Desktop Render v2.1 frontend status

- The React sequence render action now passes the selected audio `File` into the desktop payload explicitly.
- Browser-side audio IPC validation rejects invalid, empty and oversized files before reading bytes.
- The desktop payload keeps the 60 MB audio IPC guard and stores only a normalized binary handoff for Electron.

## Current backend flow

```text
createLocalRenderJob(payload)
→ write audio/input-audio when payload.audioFile exists
→ write frames/frame_0001.png ... when payload.frames exists
→ build render-plan.json
→ validate frame/audio inputs
→ spawn native FFmpeg
→ mux video + AAC audio when imported audio exists
→ cancel/retry available through IPC
```

## Recommended next stage

```text
Desktop Render v2.1 — browser audio payload, persisted retry and fixture tests
```

Suggested order:

1. Add persisted retry by rehydrating jobs from `render-job.json` and workspace files.
2. Add a fixture smoke test for native FFmpeg with generated frames and short audio.
3. Add cancel/retry buttons to persistent history entries once persisted retry exists.

## Stage close marker

This document marks the Desktop Render v2 backend stage as complete.
