# Imported mockups catalog

Date: 2026-06-08  
Source archive: `fotobeat_v3_single_shell_complete (1).zip`

## Mockups found

```text
mockups/00_contact_sheet.png
mockups/01_single_shell_creator_collapsed.png
mockups/02_editor_same_window_expanded.png
mockups/03_profile_transition_sequence.png
mockups/04_premium_components.png
```

## Asset references found

```text
assets_used/brand_header.png
assets_used/brand_sidebar.png
assets_used/corridor_bluepink_wide.png
assets_used/energy_core_editor.png
assets_used/mirror_corridor_wide.png
assets_used/neon_columns_editor.png
assets_used/spiral_wide.png
```

## Visual direction extracted

- dark neon cinematic interface,
- blue/pink/purple accent lighting,
- single-window shell,
- collapsed side navigation,
- expanded editor workspace inside the same window,
- profile transition overlay,
- premium glowing controls,
- bottom render/status strip.

## Web reuse plan

Do not copy these images blindly into `src/` as runtime assets yet. Use them as design references for:

```text
src/data/singleShellBlueprint.js
src/components/SingleShellBlueprint.jsx
src/single-shell.css
```

The first web implementation should use CSS gradients and existing UI primitives. Actual image assets can be imported later after compression and naming review.

## Integration notes

The current web app already has:

- hero section,
- project panel,
- canvas preview,
- media grid,
- audio waveform,
- frame sequence renderer,
- WebM queue,
- MP4 POC queue.

The shell migration should map these into:

```text
Topbar        -> project identity, autosave, render action
Left rail     -> project/media/audio/timeline/export/support
Center        -> canvas preview + active workspace
Right drawer  -> templates/effects/media/audio/export controls
Bottom strip  -> render queue, storage, warnings, performance
```
