# FotoBeat.me — batch 10 dużych etapów

Data: 2026-06-08
Cel: podnieść projekt z działającego prototypu WebM do stabilnej bazy pod MP4, lepszy beat engine, QA i produkcyjny render pipeline.

## 1. Audio transient detection upgrade

Dodano ulepszoną analizę audio:

- okna energii,
- lokalne piki,
- transient beats,
- medianę odstępów między beatami,
- normalizację BPM,
- tryb `transient` albo `energy-fallback`,
- większy waveform.

Plik:

```txt
src/utils/audioAnalysis.js
```

## 2. Media quality report

Dodano raport jakości mediów:

- score jakości,
- megapiksele,
- aspect ratio,
- fingerprint,
- ostrzeżenia per zdjęcie,
- grupy potencjalnych duplikatów,
- globalne ostrzeżenia projektu.

Plik:

```txt
src/utils/mediaQuality.js
```

## 3. Export manifest

Dodano manifest eksportu do późniejszej historii renderów i debugowania:

- schema `fotobeat.export-manifest.v1`,
- dane projektu,
- dane renderu,
- podsumowanie timeline,
- audio analysis,
- media quality summary.

Plik:

```txt
src/utils/exportManifest.js
```

## 4. Render profiles catalog

Dodano katalog profili renderu:

- `preview-webm-fast`,
- `preview-webm-high`,
- `mp4-mobile-vertical`,
- `mp4-wide-hd`.

Plik:

```txt
src/data/renderProfiles.js
```

## 5. Browser storage health

Dodano narzędzia diagnostyczne storage:

- `navigator.storage.estimate`,
- usage/quota,
- warning levels,
- formatowanie bajtów.

Plik:

```txt
src/utils/storageHealth.js
```

## 6. ffmpeg readiness checklist

Dodano checklistę gotowości pod MP4/ffmpeg:

- blockery,
- ostrzeżenia,
- checklist items,
- gotowość formatu,
- gotowość mediów,
- zgodność profilu.

Plik:

```txt
src/utils/ffmpegReadiness.js
```

## 7. Project diagnostics

Dodano agregator diagnostyki projektu:

- problemy krytyczne,
- ostrzeżenia,
- sugestie,
- status `ok`, `warning`, `blocked`.

Plik:

```txt
src/utils/projectDiagnostics.js
```

## 8. QA checklist

Dodano checklistę testów manualnych:

- smoke test,
- upload zdjęć,
- timeline control,
- audio analysis,
- canvas preview,
- project JSON,
- WebM export,
- persistent render history.

Plik:

```txt
docs/QA_CHECKLIST.md
```

## 9. ffmpeg / MP4 implementation plan

Dodano plan wejścia w MP4 bez rozbijania obecnego WebM pipeline:

- model render job,
- render klatek,
- ffmpeg.wasm POC,
- audio mux,
- profile MP4 9:16 i 16:9,
- ryzyka.

Plik:

```txt
docs/FFMPEG_MP4_PLAN.md
```

## 10. Batch documentation and roadmap alignment

Ten dokument zbiera cały batch i wskazuje kolejność następnego kodowego etapu.

## Rekomendowany następny commit

Nie instalować jeszcze ffmpeg.wasm. Następny bezpieczny kodowy etap:

```txt
Extract deterministic frame renderer
```

Zakres:

1. Wydzielić funkcję `renderFrameAtTime` z canvas preview.
2. Umożliwić render klatki bez `requestAnimationFrame`.
3. Dodać testowy eksport pojedynczej klatki PNG.
4. Przygotować sekwencję klatek pod późniejszy ffmpeg.wasm.

Dopiero po tym:

```txt
Add ffmpeg wasm MP4 proof of concept
```

## Status końcowy batcha

Projekt ma teraz:

- lepszy audio engine,
- media quality foundation,
- render profile model,
- export manifest model,
- storage health foundation,
- ffmpeg readiness checklist,
- project diagnostics foundation,
- QA checklist,
- MP4 plan,
- dokumentację 10 dużych etapów.
