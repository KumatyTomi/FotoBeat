# Work log

## 2026-06-07 — Project engine stage

Commits wykonane w tym etapie:

- `148a096` — dodany work log i potwierdzenie zapisu do repo.
- `8eb0b8d` — README opisuje aktywny etap `project-engine`.
- `08cd3d5` — rozbudowane formaty eksportu i presety efektów.
- `04ffd50` — timeline dostał beat grid, sekcje intro/build/drop/outro i energię klipów.
- `ac85265` — podgląd timeline pokazuje metadane, czas, sekcje i pasek energii.
- `1959bb9` — dodany panel projektu: autosave, snapshoty, eksport JSON do schowka oraz analiza audio.
- `c9f004b` — style dla panelu projektu, audio engine i timeline.
- `02caf0d` — roadmapa zaktualizowana po etapie project-engine.

## Zakres funkcjonalny

- Projekt ma nazwę i notatki.
- Stan projektu zapisuje się w `localStorage`.
- Snapshoty zapisują wariant timeline.
- Eksport projektu jako JSON kopiuje payload do schowka.
- Audio jest dekodowane w przeglądarce przez Web Audio API.
- Aplikacja szacuje energię i BPM.
- Timeline dostaje beat mapę, sekcje i warianty efektów.

## 2026-06-07 — Render preview canvas stage

Commits wykonane w tym etapie:

- `4e772ed` — dodany animowany canvas render preview w `App.jsx`.
- `ef220ab` — dodane style `src/render-preview.css`.
- `c1e0971` — import stylów render preview w `main.jsx`.
- `b0b400a` — roadmapa oznacza canvas preview jako wykonany etap.

## Zakres funkcjonalny

- Canvas działa w formatach 16:9, 9:16 i 1:1.
- Preview używa aktualnego timeline, presetu, energii klipu i sekcji timeline.
- `requestAnimationFrame` animuje podgląd bez eksportu MP4.
- HUD pokazuje rozdzielczość, czas i numer aktualnego klipu.
- Presety mają własne palety, rotacje, glow i scanlines.

## 2026-06-07 — Media pipeline stage

Commits wykonane w tym etapie:

- `b90232c` — dodany media pipeline, object URL-e, ładowanie obrazów, orientacja i `drawImage` na canvas.
- `35a7a9f` — dodane style galerii mediów i kart miniatur.
- `e5aff4b` — roadmapa oznacza media pipeline jako wykonany etap.

## Zakres funkcjonalny

- Upload zdjęć tworzy listę `mediaAssets`.
- Aplikacja czyści `objectURL` w cleanupie efektu React.
- Galeria pokazuje miniatury zdjęć, status ładowania, orientację i rozdzielczość.
- Timeline i canvas używają tylko aktywnych kadrów.
- Canvas rysuje prawdziwe zdjęcie przez `drawImage`, z kadrowaniem cover.

## 2026-06-07 — Timeline control stage

Commits wykonane w tym etapie:

- `3a3c5c5` — ręczna kolejność aktywnych kadrów, przypinanie zdjęć do klipów, scoring mediów i eksport decyzji do JSON.
- `a84dfd6` — style kart timeline control, badge score i przyciski góra/dół/przypnij.
- `ddd3e71` — roadmapa oznacza timeline control jako wykonany etap.

## Zakres funkcjonalny

- Aktywne kadry mają własną kolejność w `selectedAssetIds`.
- Karty mediów mają przyciski góra/dół do ręcznego sortowania timeline.
- Canvas respektuje przypięcia przed automatyczną kolejnością.
- Eksport JSON zawiera kolejność kadrów, przypięcia oraz score aktywnych zdjęć.

## 2026-06-07 — Project import/export upgrade

Commits wykonane w tym etapie:

- `ea9d796` — import `.fotobeat.json`, eksport jako plik, remap mediów po ID/nazwie i status importu.
- `b95e334` — style kontrolek importu/eksportu oraz statusów IO.
- `fe726c0` — roadmapa oznacza import/export jako wykonany etap.

## Zakres funkcjonalny

- Eksport projektu działa jako normalny link `download` do pliku `.fotobeat.json`.
- Kopiowanie JSON do schowka zostało zachowane jako szybka opcja debugowa.
- Import projektu działa przez input pliku JSON.
- Import waliduje schemat `fotobeat.project.v1`.
- Import odtwarza ustawienia projektu, kolejność kadrów i przypięcia.

## 2026-06-07 — Waveform + beat upgrade

Commits wykonane w tym etapie:

- `1cd0fbe` — timeline engine dostał `clipDurationScale` i skalowanie beat gridu.
- `446d2f1` — aplikacja dostała waveform, beat grid i suwak korekty długości klipów.
- `b36840e` — style waveform, beat markers i range control.
- `13fad76` — roadmapa oznacza waveform + beat upgrade jako wykonany etap.

## Zakres funkcjonalny

- Analiza audio generuje `waveform` z próbek kanału audio.
- UI pokazuje waveform jako słupki.
- Beat grid jest nakładany na waveform jako znaczniki.
- Projekt ma `clipDurationScale` zapisywany w autosave i eksporcie JSON.
- Timeline przelicza start i duration klipów według korekty.

## 2026-06-08 — P0 refactor and quality gate

Commits wykonane w tym etapie:

- `db7499b` — dodany audyt techniczny w `docs/AUDIT.md`.
- `e2bc320` — wydzielone utils importu/eksportu projektu.
- `022f2bc` — wydzielone utils scoringu i mapowania mediów.
- `707628c` — wydzielone utils analizy audio.
- `61b1255` — wydzielony renderer canvas.
- `af48ba9` — dodany hook `useProjectState`.
- `d263873` — dodany hook `useMediaAssets`.
- `8f07bc2` — dodany hook `useAudioAnalysis`.
- `2d70c63` — dodany hook `useCanvasPreview`.
- `64e6387` — wydzielony komponent `WaveformPreview`.
- `64d7f1b` — `App.jsx` używa wydzielonych hooków i utils.
- `35e3cdb` — dodana konfiguracja ESLint flat config.
- `12f065a` — dodany GitHub Actions CI.

## Zakres funkcjonalny

- `App.jsx` przestał być monolitem z całą logiką domenową.
- Logika projektu, mediów, audio i canvas jest wydzielona do osobnych modułów.
- Repo ma konfigurację ESLint.
- Repo ma workflow CI uruchamiający lint i build.

## 2026-06-08 — MediaRecorder WebM proof of concept

Commits wykonane w tym etapie:

- `f72ecd5` — dodany hook `useCanvasRecorder` do nagrywania canvas preview przez MediaRecorder.
- `f888836` — dodany panel eksportu WebM w aplikacji.
- `333498e` — style panelu eksportu i statusów nagrywania.
- `11b7480` — uproszczony skrypt lint dla ESLint flat config.
- `2bd568e` — roadmapa oznacza WebM proof of concept jako wykonany etap.

## Zakres funkcjonalny

- Canvas preview można nagrać do pliku `.webm`.
- Eksport używa `canvas.captureStream(30)` i `MediaRecorder`.
- Aplikacja wybiera wspierany MIME: VP9, VP8 albo podstawowy WebM.
- Maksymalny czas nagrania jest ograniczony do 30 sekund.
- Po nagraniu UI pokazuje link pobierania WebM.
- Pierwsza wersja eksportuje obraz bez ścieżki audio.

## 2026-06-08 — WebM audio track stage

Commits wykonane w tym etapie:

- `ca24ce0` — recorder łączy canvas video track z audio track przez Web Audio API.
- `3e5c8c2` — UI przekazuje audio file do eksportu WebM i aktualizuje copy panelu.
- `8bd87d3` — roadmapa oznacza WebM z audio track jako wykonany etap.

## Zakres funkcjonalny

- Eksport WebM może zawierać obraz z canvas i audio z wrzuconego pliku.
- Audio jest dekodowane przez `AudioContext.decodeAudioData`.
- Ścieżka audio trafia do `MediaStreamDestination`.
- MediaRecorder nagrywa połączony stream: video track + audio track.
- MIME preferuje warianty z `opus`: VP9/Opus lub VP8/Opus.
- Gdy brak pliku audio, eksport nadal działa jako WebM z samym obrazem.

## Następny rekomendowany etap

Render queue/status panel: historia eksportów WebM, statusy nagrań, lista plików do pobrania i przygotowanie interfejsu pod późniejszy ffmpeg.wasm / MP4.
