# Integracja paczek v200 i GUI v3 z FotoBeat Desktop

## Decyzja

Łączymy najlepsze elementy paczek, ale nie sklejamy aplikacji 1:1.

```text
React/Electron zostaje głównym Desktop UI.
Python v200 traktujemy jako źródło logiki i sprawdzonych procesów.
GUI v3 traktujemy jako blueprint układu single-shell.
```

## Paczki źródłowe

- `fotobeat_v200_gui_editor_optimization(1).zip`
- `fotobeat_gui_v3_plan_mockups(3).zip`

## Co przenosimy koncepcyjnie z v200

| Plik v200 | Wartość | Kierunek w FotoBeat Desktop |
|---|---|---|
| `fotobeat/renderer.py` | Render pipeline, progress callbacks, walidacja joba | `desktop/src/renderPlan.cjs`, później natywny FFmpeg worker |
| `fotobeat/render_queue.py` | add/get/progress/done/failed/cancel/retry/duplicate | rozbudowa `desktop/src/renderQueue.cjs` |
| `fotobeat/export_integrity.py` | free space check, safe output path, temp path, sidecar, checksum, postflight | `desktop/src/exportIntegrity.cjs` |
| `fotobeat/project.py` | autosave, recent projects, export history, snapshots | local-first project service w Electron/React |
| `runtime_doctor.py`, `startup.py`, `scripts/*` | diagnostyka środowiska, FFmpeg check, Windows helpers | desktop doctor, support bundle, build scripts |

## Czego nie przenosimy bezpośrednio

Nie przenosimy bezpośrednio `fotobeat/app.py`.

Powody:

- duży monolit GUI,
- CustomTkinter zamiast React/Electron,
- dużo stanu i callbacków w jednej klasie,
- trudne utrzymanie po połączeniu z nowym Desktop UI.

Ten plik traktujemy jako specyfikację zachowania, nie jako kod do wklejenia.

## Co bierzemy z GUI v3

GUI v3 potwierdza kierunek:

```text
single-shell app
left rail / drawer
center workspace
right drawer
bottom render queue/status
bez osobnego okna edytora
```

To jest docelowy UX dla FotoBeat Desktop.

## Architektura docelowa Desktop

```text
React UI
→ desktop bridge
→ render manifest
→ render-plan.json
→ local workspace
→ FFmpeg command plan
→ local MP4
→ postflight/integrity report
```

## Etapy integracji

### Etap 1 — manifest i render-plan

Status: zaczęte.

- generować `render-plan.json`,
- zapisywać go w folderze joba,
- opisać output, inputy, sequence, audio, format, preset.

### Etap 2 — integrity checks

Dodać odpowiednik v200 `export_integrity.py`:

- sprawdzanie folderu eksportu,
- sprawdzanie wolnego miejsca,
- collision-safe output path,
- temp output path,
- sidecar JSON,
- cleanup partial output.

### Etap 3 — queue hardening

Rozbudować `renderQueue.cjs` o:

- cancel,
- retry,
- duplicate,
- failed state z reason,
- history na dysku.

### Etap 4 — natywny FFmpeg

Zastąpić placeholder `.mp4` realnym procesem:

```text
ffmpeg -framerate <fps> -i frames/frame_%04d.png -i audio.wav ... output.mp4
```

Najpierw plan komendy, potem wykonanie.

### Etap 5 — desktop shell GUI v3

Przebudować UI na single-shell:

- topbar,
- left rail,
- center editor,
- right inspector,
- bottom queue.

## Zasada bezpieczeństwa migracji

Każdy element przenosimy jako osobny mały moduł, z prostym JSON kontraktem i możliwością testowania bez GUI.

Nie robimy masowego importu starego kodu.
