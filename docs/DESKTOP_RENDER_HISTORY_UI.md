# Desktop render history UI integration

## Status

Desktop render history is already available in the renderer bridge and as a reusable React component.

Implemented pieces:

- `desktop/src/jobHistory.cjs` persists render history to `~/.fotobeat-desktop/render-history.json`.
- `desktop/src/main.cjs` exposes:
  - `fotobeat:list-render-history`
  - `fotobeat:clear-render-history`
- `desktop/src/preload.cjs` exposes:
  - `window.fotobeatDesktop.listRenderHistory(limit)`
  - `window.fotobeatDesktop.clearRenderHistory()`
- `src/hooks/useDesktopBridge.js` now returns:
  - `renderHistory`
  - `refreshRenderHistory(limit)`
  - `clearRenderHistory()`
- `src/components/DesktopRenderHistory.jsx` renders the history list.

## Next safe `App.jsx` integration

Add the import near the other component imports:

```jsx
import DesktopRenderHistory from './components/DesktopRenderHistory.jsx';
```

Then insert this block inside the `Desktop render` panel, after the active `desktop.localRenderJob` block and before the closing `</section>` of that panel:

```jsx
<DesktopRenderHistory
  history={desktop.renderHistory}
  disabled={!desktop.available}
  onRefresh={() => desktop.refreshRenderHistory()}
  onClear={desktop.clearRenderHistory}
/>
```

## Why this is separated

`src/App.jsx` is currently a large single-file UI. A full-file rewrite for a small UI insertion is easy to make brittle. The safer follow-up is either:

1. do a minimal verified edit with a proper patch workflow, or
2. extract the whole `Desktop render` panel into its own component first, then add `DesktopRenderHistory` inside that component.

Recommended next refactor:

```text
src/components/DesktopRenderPanel.jsx
```

Responsibilities:

- FFmpeg health
- output folder selection
- current desktop job
- persistent render history
- desktop render actions

This would reduce the size and risk of future edits to `App.jsx`.
