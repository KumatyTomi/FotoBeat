# Web single-shell import log

Date: 2026-06-08

## Scope

This log records the safe extraction of desktop GUI v3 concepts into the current React/Vite web app.

## Commits

- `82bf9ec` — added `SINGLE_SHELL_WEB_UI_SPEC.md`.
- `b1161c2` — added imported mockups catalog.
- `c0bd21b` — added `src/data/singleShellBlueprint.js`.
- `316e7b0` — added `SingleShellBlueprint.jsx`.
- `2e72bc4` — added `src/single-shell.css`.
- `cfe802e` — added 1247-task roadmap web prioritization.

## Result

The uploaded desktop package was used as a UX/product reference, not as runtime code. The current product remains the React/Vite web app.

## Added web-native artifacts

```text
src/data/singleShellBlueprint.js
src/components/SingleShellBlueprint.jsx
src/single-shell.css
docs/imported/SINGLE_SHELL_WEB_UI_SPEC.md
docs/imported/IMPORTED_MOCKUPS_CATALOG.md
docs/imported/ROADMAP_1247_WEB_PRIORITIZATION.md
```

## Next step

Mount `SingleShellBlueprint` behind a feature flag or non-invasive preview panel, then gradually migrate current panels into shell regions.
