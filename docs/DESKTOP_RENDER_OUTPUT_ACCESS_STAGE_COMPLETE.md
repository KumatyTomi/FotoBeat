# FotoBeat Desktop Render Output Access Stage — complete

## Stage status

This stage is closed.

It completes the user-facing access layer for desktop render outputs: persistent render history, visible job status, output file discovery and job workspace access.

## Completed scope

### Persistent render history UI

- Desktop render history is loaded through the React desktop bridge.
- History is shown in the Desktop render panel.
- User can refresh the render history.
- User can clear the render history.
- History entries show status, mode, output path, frame import summary, MP4 size and last log.

### Desktop render panel extraction

- Desktop render UI was extracted from `App.jsx` into `src/components/DesktopRenderPanel.jsx`.
- Persistent history UI is handled by `src/components/DesktopRenderHistory.jsx`.
- Desktop-specific styles live in `src/desktop-render.css`.
- `App.jsx` now delegates the whole desktop render panel to the extracted component.

### Output access actions

Electron now exposes safe local path actions through IPC and preload:

```text
showItemInFolder(path)
openPath(path)
```

The React bridge exposes:

```text
desktop.showItemInFolder(path)
desktop.openPath(path)
```

The UI exposes actions for both active render jobs and historical entries:

```text
Pokaż plik
Folder joba
```

### Styling

- Desktop render history cards have dedicated styling.
- Path action buttons are compact and responsive.
- Long file paths and logs wrap safely.
- Small-width layouts keep action buttons aligned and readable.

## Current product behavior

The complete user-facing flow is now:

```text
1. Render PNG frame sequence.
2. Click Desktop MP4.
3. Native FFmpeg produces a local MP4.
4. Render appears in current job status and persistent history.
5. User can click Pokaż plik to reveal the MP4 in the system file manager.
6. User can click Folder joba to inspect the full workspace with manifest, render plan, frames and sidecar.
```

## Files touched during this stage

```text
src/components/DesktopRenderPanel.jsx
src/components/DesktopRenderHistory.jsx
src/hooks/useDesktopBridge.js
src/desktop-render.css
src/main.jsx
desktop/src/main.cjs
desktop/src/preload.cjs
```

## Known limitations left for next stage

- Retry failed render from history is not implemented yet.
- Cancel native FFmpeg render is not implemented yet.
- Audio import/muxing is not fully wired into native render jobs yet.
- Large frame sequences still need a chunked/file-backed handoff rather than direct IPC payloads.
- The desktop history can be cleared, but individual history entries cannot be deleted yet.

## Recommended next stage

```text
Desktop Render v2 — audio muxing, cancel, retry and fixture tests
```

Suggested order:

1. Import uploaded browser audio into desktop job workspace.
2. Extend `render-plan.json` to point to real audio input.
3. Add AAC muxing through native FFmpeg.
4. Track running FFmpeg processes by job id.
5. Add cancel action for active native renders.
6. Add retry action for failed render history entries.
7. Add a smoke fixture that renders a short MP4 through native FFmpeg.

## Stage close marker

This document marks the desktop render output access and history UI stage as complete.
