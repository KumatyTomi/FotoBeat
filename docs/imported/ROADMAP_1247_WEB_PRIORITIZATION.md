# FotoBeat.me — Roadmap 1247 tasks web prioritization

Date: 2026-06-08  
Source: uploaded `FotoBeat_me_Roadmap_v2.0_to_v4.0_1247_tasks(1).txt`

## Source structure

The uploaded roadmap contains 1247 tasks and groups them into large phases:

| Phase | Source range | Source title | Web priority |
|---|---:|---|---|
| 0 | 1-150 | Fundamenty i audyt | High |
| 1 | 151-350 | Single Shell GUI v3 - fundamenty | High |
| 2 | 351-600 | Funkcje zaawansowane i polish | Medium |
| 3 | 501-750 | Jakość, testy, wydajność i dystrybucja | Medium |
| 4 | 601-850 | Przyszłość i innowacje | Future |
| 5 | 751-1000+ | Ekosystem i skala | Future |

## Web app interpretation

The current active codebase is React/Vite, not the uploaded Python/CustomTkinter desktop snapshot. Therefore the roadmap should be interpreted as a product backlog, not a direct implementation order.

## Immediate web priorities extracted

### P0 — keep current render pipeline stable

Source influence: phase 0, tasks 1-150.

Web implementation targets:

- CI stability,
- runtime safety boundary,
- storage diagnostics,
- render job diagnostics,
- export history integrity,
- local-first data safety,
- MP4 proof-of-concept stabilization.

### P1 — single-shell web UI

Source influence: phase 1, tasks 151-350.

Web implementation targets:

- one-window/single-shell web layout,
- profile-driven section visibility,
- topbar / left rail / center / right drawer / bottom queue,
- collapsed-by-default heavy panels,
- profile transition overlay,
- Editor workspace inside shell,
- render queue visible as bottom strip.

### P2 — editor/timeline controls

Source influence: phase 1 plus phase 2.

Web implementation targets:

- manual timeline controls,
- clip duration editor,
- transition controls,
- motion controls,
- audio marker controls,
- timeline validation,
- timeline diagnostics.

### P3 — production MP4

Source influence: phase 0 and phase 3.

Web implementation targets:

- MP4 audio mux UI,
- storage/memory guards,
- production profile limits,
- ffmpeg.wasm runtime diagnostics,
- segment rendering plan,
- safer export queue.

### P4 — advanced polish

Source influence: phase 2+.

Web implementation targets:

- advanced templates,
- premium effect controls,
- safe zones,
- social media presets,
- keyboard shortcuts,
- command palette,
- accessibility pass.

## Tasks not suitable for immediate web implementation

The roadmap includes many future enterprise/business/HR/ecosystem tasks. Those are not useful for the current coding sprint and should not block core product work.

Examples to defer:

- enterprise compliance programs,
- IPO/readiness/business operations,
- HR/employee programs,
- large-scale cloud architecture,
- marketplace/business ecosystem features,
- AI features unrelated to local photo+music rendering.

## Next code stages for the web app

1. Mount `SingleShellBlueprint` behind a feature flag or preview panel.
2. Add `activeShellProfile` state to project settings.
3. Move current panels into a `SHELL_SECTION_REGISTRY`.
4. Add topbar profile switcher.
5. Add bottom queue strip with WebM/MP4/storage status.
6. Add right drawer accordions.
7. Add Editor profile as current advanced workflow.
8. Add Debug profile for ffmpeg/storage/runtime diagnostics.
9. Add MP4 audio mux UI.
10. Add storage health panel.

## Current output of this import step

Created web-native artifacts:

```text
src/data/singleShellBlueprint.js
src/components/SingleShellBlueprint.jsx
src/single-shell.css
docs/imported/SINGLE_SHELL_WEB_UI_SPEC.md
docs/imported/IMPORTED_MOCKUPS_CATALOG.md
docs/imported/ROADMAP_1247_WEB_PRIORITIZATION.md
```
