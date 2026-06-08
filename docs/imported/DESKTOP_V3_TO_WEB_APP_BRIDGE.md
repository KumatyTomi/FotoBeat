# Desktop v3 snapshot → current web app bridge

Date: 2026-06-08

## Source

Uploaded archive analyzed locally:

```text
fotobeat_v3_single_shell_complete (1).zip
```

Uploaded roadmap analyzed locally:

```text
FotoBeat_me_Roadmap_v2.0_to_v4.0_1247_tasks(1).txt
```

## Strategic decision

The uploaded folder is a separate Python/CustomTkinter desktop application snapshot. The current repository has been developed as a React/Vite browser application with canvas rendering, IndexedDB storage, WebM export and ffmpeg.wasm MP4 POC.

These tracks should not be merged directly file-for-file. The desktop snapshot should be treated as:

1. a design/reference archive,
2. a source of feature ideas,
3. a source of mockups and domain concepts,
4. not as runtime code for the current web application.

## What should be reused

### Strong candidates

- Single-shell layout concepts.
- Profile switching ideas.
- Editor workspace organization.
- Render queue diagnostics concepts.
- Audit gates and release protocol documents.
- Mockup visual direction.
- Audio marker and timeline terminology.

### Weak candidates / risky direct imports

- Direct CustomTkinter UI code.
- Desktop file path assumptions.
- MoviePy-specific renderer code.
- Windows build scripts.
- Large monolithic `app.py` design.

## Current web app equivalents

| Desktop snapshot concept | Current web app equivalent |
|---|---|
| CustomTkinter shell | React component tree in `src/App.jsx` |
| Desktop render queue | IndexedDB render history / render jobs |
| MoviePy renderer | Canvas + MediaRecorder + ffmpeg.wasm POC |
| Local project folders | localStorage + IndexedDB |
| Windows EXE build | Vite web build |
| GUI mockups | future web UI reference |
| Audio marker summary | audio analysis / beat grid foundation |

## Recommended migration sequence

1. Keep archive in `imports/fotobeat_v3_single_shell_complete/`.
2. Extract visual/UI ideas into React components only after review.
3. Convert desktop concepts into web-native modules, not direct ports.
4. Create a `DESKTOP_PARITY_CHECKLIST.md` if desktop functionality is still needed.
5. Use the 1247-task roadmap as a backlog reference, but prioritize current web milestones first.

## Immediate next actions

- Create a dependency manifest for the Python snapshot only if the desktop branch will be revived.
- Continue current web pipeline: MP4 audio mux UI, storage health panel, production export profiles.
- Use mockups from the uploaded snapshot to guide React shell redesign.

## Status

The folder was analyzed and documented. The active codebase remains the React/Vite app.
