# FotoBeat.me — Single Shell Web UI Spec

Date: 2026-06-08  
Source: uploaded `fotobeat_v3_single_shell_complete` desktop snapshot.

## Decision

The desktop package contains a strong GUI v3 concept. The concept should be reused, but the Python/CustomTkinter code should not be directly ported into the active React/Vite app.

The web version should implement the idea as a React single-shell layout:

```text
Topbar
Left rail / drawer
Center workspace
Right drawer
Bottom status / render queue
Transition overlay
```

## Web interpretation

### Topbar

Purpose:

- product identity,
- profile switcher,
- project status,
- primary actions.

Recommended web components:

```text
ShellTopbar
ProfileSwitcher
AutosaveStatus
PrimaryRenderAction
```

### Left rail

Purpose:

- main navigation,
- compact icon-only default,
- expandable labels.

Sections:

```text
project
media
audio
timeline
export
support
```

### Center workspace

Purpose:

- mode-dependent main workspace.

Profiles:

```text
simple     -> quick project flow
creator    -> default guided editor
editor     -> full manual timeline workspace
debug      -> diagnostics and developer tools
```

### Right drawer

Purpose:

- contextual controls,
- accordion groups,
- collapsed by default for heavy panels.

Sections:

```text
templates
style
photo_selection
music
audio_markers
export
batch
```

### Bottom queue/status

Purpose:

- render queue,
- warnings,
- performance,
- local storage status,
- MP4/WebM export status.

Sections:

```text
queue
warnings
performance
support_status
storage
```

### Transition overlay

Purpose:

- visual continuity during profile switch,
- glow strip / blur overlay,
- no route reload.

## Profile visibility matrix

| Section | Simple | Creator | Editor | Debug |
|---|---:|---:|---:|---:|
| Quick upload | yes | yes | yes | yes |
| Templates | yes | yes | optional | optional |
| Audio basic | yes | yes | yes | yes |
| Timeline | no | compact | yes | yes |
| Manual clip controls | no | optional | yes | yes |
| Render queue | compact | compact | yes | yes |
| MP4/ffmpeg diagnostics | no | no | optional | yes |
| Storage health | no | compact | yes | yes |
| Runtime logs | no | no | no | yes |
| Support bundle | yes | yes | yes | yes |

## Data-first rule

Profile layout should be data-driven, not hardcoded with scattered `if` statements.

Recommended web data module:

```text
src/data/singleShellBlueprint.js
```

Recommended component scaffold:

```text
src/components/SingleShellBlueprint.jsx
```

## Migration rules

1. Do not paste Python GUI code into React.
2. Convert desktop concepts into web-native data and components.
3. Keep current render pipeline intact.
4. Build shell incrementally around the existing `App.jsx` features.
5. Use uploaded mockups as visual direction, not runtime assets until reviewed.

## First implementation target

Add a non-invasive React blueprint component that can render the intended shell anatomy without replacing the current app.

This allows iterative migration:

```text
current App.jsx
  -> add shell blueprint data
  -> add shell preview component
  -> gradually move panels into shell regions
  -> activate profile switcher
```

## Next stages

1. Add shell blueprint data module.
2. Add shell blueprint React component.
3. Add shell CSS classes.
4. Add a docs catalog of imported mockups.
5. Later: mount shell component into the current app behind a feature flag.
