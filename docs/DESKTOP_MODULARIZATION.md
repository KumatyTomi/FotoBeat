# FotoBeat Desktop modularization

## Objective

Split the desktop app into clear modules and keep the existing renderer API stable while moving toward a Windows installer.

## Done

- `desktop/src/windowFactory.cjs` owns Electron window creation.
- `desktop/src/pathSafety.cjs` owns known render roots and path checks.
- `desktop/src/main.cjs` is now a smaller composition entrypoint.
- `src/visual-theme.css` and `src/vajra-override.css` define the Vajra Flash glass direction.
- `.github/workflows/windows-installer.yml` builds a Windows NSIS installer and uploads it as an artifact.

## Next split targets

- Extract IPC registration from `main.cjs` into `desktop/src/ipcHandlers.cjs`.
- Extract `src/App.jsx` into Project, Preview, Export, Media and Controls sections.
- Add tests for `pathSafety.cjs` and render-plan generation.
