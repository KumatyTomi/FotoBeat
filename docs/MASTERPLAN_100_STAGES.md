# FotoBeat.me — masterplan 100 etapów

Data: 2026-06-08
Cel: doprowadzić FotoBeat od prototypu WebM do produktu z MP4, lepszym beat engine, stabilnym UX, storage, presetami premium i przygotowaniem backendowym.

## Faza 1 — Render core i klatki pod MP4

1. Extract deterministic frame renderer. **Done**
2. Eksport pojedynczej klatki PNG z aktualnego preview. **Done**
3. Render frame by timestamp bez `requestAnimationFrame`. **Done**
4. Render sekwencji 10 klatek do pamięci. **Done**
5. Render sekwencji PNG do IndexedDB. **Done**
6. Frame render progress UI. **Done**
7. Frame render cancel button. **Done**
8. Frame render memory guard. **Done — limit 5s @ 12fps**
9. Frame render FPS selector: 24/30. **Planned — obecnie limit 12fps**
10. Frame render duration limiter. **Done — max 5s**

## Faza 2 — ffmpeg.wasm i MP4 POC

11. Lazy-load ffmpeg.wasm.
12. ffmpeg core loading progress.
13. MP4 POC bez audio z 3 sekund klatek.
14. MP4 POC 9:16.
15. MP4 POC 16:9.
16. MP4 output zapisany w IndexedDB.
17. MP4 download link w render queue.
18. ffmpeg error handling.
19. ffmpeg memory cleanup.
20. Browser compatibility fallback do WebM.

## Faza 3 — Audio mux i synchronizacja

21. Przycinanie audio do długości renderu.
22. Audio mux do MP4.
23. Audio/video sync validation.
24. Offset audio controls.
25. Fade-in/fade-out audio.
26. Normalizacja głośności.
27. Beat markers export do manifestu.
28. Audio preview scrubber.
29. Audio waveform zoom.
30. Manual beat correction.

## Faza 4 — Beat engine advanced

31. Adaptive transient threshold.
32. Beat confidence score.
33. Downbeat detection heuristic.
34. Section detection z energii: intro/build/drop/outro.
35. Manual BPM override.
36. Tap tempo input.
37. Beat grid snap controls.
38. Clip cut quantization.
39. Energy curve smoothing.
40. Beat engine diagnostics panel.

## Faza 5 — Media quality advanced

41. Sharpness score przez canvas/laplacian approximation.
42. Blur warning.
43. Face/object safe-zone placeholder.
44. Duplicate detection by perceptual mini-hash.
45. Low-resolution auto-warning.
46. Orientation mismatch recommendation.
47. Crop preview overlay.
48. Smart cover crop anchor.
49. Media quality panel UI.
50. Batch select best photos.

## Faza 6 — Timeline editor

51. Drag & drop clip order.
52. Drag & drop photo to clip.
53. Manual clip duration editor.
54. Split clip.
55. Duplicate clip.
56. Delete clip.
57. Lock clip.
58. Timeline zoom.
59. Timeline keyboard shortcuts.
60. Timeline undo/redo stack.

## Faza 7 — Presety, efekty i style

61. Preset parameter editor.
62. Effect intensity slider.
63. Per-clip effect override.
64. Text overlay basic.
65. Logo/watermark toggle.
66. Color palette selector.
67. Motion style selector.
68. Transition style selector.
69. Save custom preset locally.
70. Premium preset registry placeholder.

## Faza 8 — Project system i storage

71. Project list panel.
72. Project duplicate.
73. Project delete.
74. Project import conflict resolver.
75. Missing media panel.
76. Media fingerprint migration.
77. IndexedDB media cache POC.
78. Storage quota panel.
79. Export manifest download per render.
80. Project package ZIP plan.

## Faza 9 — Product UX i dashboard

81. First-run onboarding.
82. Empty-state improvements.
83. Export success modal.
84. Render history filters.
85. Render history search.
86. Dashboard shell.
87. Settings panel.
88. Keyboard help panel.
89. Mobile layout polish.
90. Error boundary.

## Faza 10 — Backend readiness i komercjalizacja

91. Auth provider decision doc.
92. Backend render API contract.
93. Cloud storage contract.
94. Payments plan.
95. User subscription tiers.
96. Preset marketplace model.
97. Landing sales copy.
98. Privacy and local-processing policy.
99. Public beta checklist.
100. Release candidate checklist.

## Aktualnie wykonany krok z setki

Wykonano znaczną część Fazy 1:

- `renderFrameAtTime` w `canvasRenderer.js`,
- `useCanvasPreview` używa deterministic frame renderer,
- `useFrameExporter` eksportuje PNG z aktualnej klatki,
- `frameSequenceStorage.js` zapisuje sekwencje PNG w IndexedDB,
- `useFrameSequenceRenderer` generuje sekwencje klatek z progressem i cancel,
- UI pokazuje frame sequence panel i zapisane sekwencje.

## Następny kodowy etap

```txt
Frame sequence ZIP export
```

Zakres:

1. Odczytać zapisaną sekwencję PNG z IndexedDB.
2. Spakować klatki do ZIP lub przygotować manifest bez kompresji, jeśli ZIP dependency nie będzie dodawana.
3. Dodać pobieranie paczki klatek.
4. Przygotować strukturę nazw `frame_0001.png` pod ffmpeg.wasm.
5. Potem wejść w `ffmpeg.wasm proof of concept`.
