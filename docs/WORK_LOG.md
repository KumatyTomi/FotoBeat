# Work log

## 2026-06-08 — Masterplan 100 stages + deterministic frame renderer

Commits wykonane w tym etapie:

- `23fd313` — wydzielony `renderFrameAtTime` i `normalizeFrameTime` w `canvasRenderer.js`.
- `3ee0cc6` — `useCanvasPreview` używa deterministic frame renderer.
- `b27b396` — dodany `useFrameExporter` do eksportu pojedynczej klatki PNG.
- `9c7db06` — UI dostało eksport aktualnej klatki PNG i link pobierania.
- `ae0844f` — style dla kontrolek i statusu eksportu PNG.
- `bfc851f` — dodany `docs/MASTERPLAN_100_STAGES.md`.
- `1b8ac29` — roadmapa oznacza deterministic renderer i PNG frame export jako wykonane.

## Zakres funkcjonalny

- Render pojedynczej klatki został wydzielony z animowanego preview.
- Ten sam renderer obsługuje teraz preview i eksport testowej klatki.
- `useCanvasPreview` nie zna już szczegółów wyboru klipu ani mediów dla klatki.
- `useFrameExporter` renderuje aktualny czas preview i generuje PNG przez `canvas.toDataURL`.
- UI ma przycisk `Eksportuj klatkę PNG`, link `Pobierz PNG` i status eksportu.
- Dodano masterplan 100 etapów rozwoju FotoBeat.

## Dlaczego to ważne

To pierwszy praktyczny krok pod MP4. ffmpeg.wasm potrzebuje sekwencji deterministycznych klatek. Teraz aplikacja potrafi wyrenderować konkretną klatkę po czasie `t`, niezależnie od pętli `requestAnimationFrame`.

## Następny rekomendowany etap

Render frame sequence to IndexedDB: generować serię klatek PNG z `renderFrameAtTime`, zapisać je do IndexedDB, pokazać progress/cancel i przygotować wejście dla ffmpeg.wasm / MP4.
