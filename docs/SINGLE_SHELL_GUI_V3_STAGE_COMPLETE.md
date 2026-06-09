# FotoBeat.me Single Shell GUI v3 — Stage 1 complete

## Stage status

This stage introduces the Single Shell architecture in the current Electron + Vite + React repository.

The implementation keeps the existing creator/editor logic intact and wraps it in a stable shell layout instead of opening a second window or rewriting the whole app at once.

## Implemented shell structure

```text
BrowserWindow
├── TopBar
├── LeftRail
├── CenterWorkspace
├── RightDrawer
├── BottomQueue
└── ProfileTransitionOverlay
```

## Added files

```text
src/components/shell/ShellContainer.jsx
src/components/shell/TopBar.jsx
src/components/shell/LeftRail.jsx
src/components/shell/CenterWorkspace.jsx
src/components/shell/RightDrawer.jsx
src/components/shell/BottomQueue.jsx
src/components/ui/PremiumButton.jsx
src/components/ui/CollapsiblePanel.jsx
src/components/ui/AccordionGroup.jsx
src/components/ui/AnimatedTransition.jsx
src/hooks/useProfile.js
src/hooks/useCollapsible.js
src/hooks/useAnimation.js
src/single-shell.css
```

## Behavior

- The app now runs inside a single GUI shell.
- Profiles are available as `simple`, `creator`, `editor`, and `debug`.
- Profile switching uses a deterministic 420ms overlay/crossfade animation.
- Left rail, right drawer and bottom queue are collapsible.
- Collapsed layout state persists in `localStorage` under `fotobeat.gui.v3.config`.
- Active profile also persists in the same config object.
- Center workspace remains the existing app content, so the current renderer and desktop render features continue to work.

## Design notes

The current stage intentionally avoids a large `App.jsx` split. The shell is mounted from `main.jsx`:

```jsx
<ShellContainer>
  <App />
</ShellContainer>
```

This keeps the migration safe and creates the target frame for later profile-specific workspace extraction.

## Next stage

```text
Single Shell GUI v3 — Stage 2: CenterWorkspace extraction and profile-aware sections
```

Recommended next steps:

1. Move the hero/project/preview/upload/audio sections into dedicated Creator workspace components.
2. Move Desktop render and frame sequence sections into Editor workspace components.
3. Add Debug workspace with diagnostics, FFmpeg status, render plans and queue logs.
4. Replace localStorage-only config with preload-backed `gui_config.json` sync.
5. Add keyboard navigation for rail/drawer/accordion controls.

## Stage close marker

This document marks Single Shell GUI v3 Stage 1 as complete.
