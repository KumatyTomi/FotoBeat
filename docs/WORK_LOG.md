# Work log

## 2026-06-08 — Broad render planning batch

Commits wykonane w tym etapie:

- `603a134` — dodany render job model: statusy, targety, create/patch helpers.
- `f7e4bfe` — dodany IndexedDB storage dla render jobs.
- `f9529be` — dodana walidacja frame sequence przed ffmpeg.
- `e285d1f` — dodany ffmpeg command builder dla PNG sequence -> MP4.
- `d35d744` — dodany MP4 export plan adapter bez zależności ffmpeg.
- `6d9ee27` — dodany hook `useRenderJobs`.
- `4f0d178` — UI dostało render jobs panel i akcję `Plan MP4`.
- `1263cb0` — roadmapa zaktualizowana po batchu render jobs / MP4 planning.

## Zakres funkcjonalny

- Projekt ma model render jobów gotowy pod WebM, ZIP, PNG sequence i przyszłe MP4.
- Render jobs są zapisywane w IndexedDB.
- Sekwencje klatek mają walidację: blockery, warnings i statystyki.
- ffmpeg command builder generuje komendę dla PNG sequence -> MP4 bez audio.
- Dodano też wariant komendy z audio jako przygotowanie do muxingu.
- MP4 export plan buduje virtual file plan, komendę ffmpeg i shell preview.
- UI pozwala utworzyć lokalny render job dla ZIP i planu MP4.
- Ten batch nie dodaje jeszcze ciężkiej zależności ffmpeg.wasm, żeby nie rozwalić CI po poprzednim failu.

## Następny rekomendowany etap

ffmpeg.wasm proof of concept: dodać dependency, lazy-load core, wrzucić klatki z zapisanej sekwencji do virtual FS i wygenerować pierwszy krótki MP4 bez audio.
