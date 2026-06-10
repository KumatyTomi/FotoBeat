# GUI v3 Zustand persist stage

## Summary

GUI v3 persistent shell state has moved from manual `localStorage` helpers into one Zustand store.

New store:

```text
src/stores/guiStore.js
```

It owns:

```text
activeProfile
collapsed.leftRail
collapsed.rightDrawer
collapsed.bottomQueue
```

## Storage keys

New persisted key:

```text
fotobeat.gui.v3.store
```

Legacy key still read once for migration:

```text
fotobeat.gui.v3.config
```

The legacy key is not written anymore.

## Hook compatibility

The existing hook APIs remain intact:

```text
useProfile()
useCollapsible()
```

Shell components do not need to know about Zustand directly.

## Profile switching

`useProfile()` still controls transition phases locally:

```text
idle
overlay
collapse
swap
expand
```

The selected `activeProfile` is persisted in Zustand.

Timeouts are now cleaned up on unmount and before a new profile switch starts, preventing overlapping profile transitions after rapid clicks.

## Collapsible layout

`useCollapsible()` is now a thin adapter around the GUI store.

It exposes the same API:

```text
collapsed
setPanelCollapsed(panel, value)
togglePanel(panel)
```

## Safety

The store validates known profile IDs and known panel IDs before writing state.

For non-browser contexts, the persist storage falls back to an in-memory implementation instead of touching `window.localStorage` directly.

## Next steps

1. Add a visible reset layout action using `resetGuiLayout()`.
2. Move any future shell state into `guiStore.js` instead of adding more manual `localStorage` helpers.
3. Add tests for profile switching once a test runner is introduced.
