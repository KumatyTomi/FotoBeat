# FotoBeat.me — ffmpeg.wasm / MP4 plan

## Cel

Dodać produkcyjny eksport MP4 9:16 i 16:9 bez niszczenia obecnego, działającego WebM pipeline.

## Dlaczego nie zastępować MediaRecorder od razu

Obecny WebM pipeline:

- działa w przeglądarce,
- obsługuje canvas preview,
- obsługuje audio track,
- zapisuje historię w IndexedDB,
- jest szybki dla preview.

ffmpeg.wasm powinien być dodany jako osobny backend renderu, nie jako zamiennik.

## Etap A — przygotowanie modelu renderu

- [ ] Dodać `renderJob` model:
  - `id`,
  - `profileId`,
  - `format`,
  - `preset`,
  - `timeline`,
  - `mediaRefs`,
  - `audioRef`,
  - `status`,
  - `progress`,
  - `createdAt`,
  - `completedAt`.
- [ ] Rozdzielić render target:
  - `mediarecorder-webm`,
  - `ffmpeg-mp4`.
- [ ] Dodać statusy:
  - `queued`,
  - `preparing`,
  - `rendering-frames`,
  - `encoding`,
  - `ready`,
  - `error`.

## Etap B — render klatek

- [ ] Wydzielić `renderFrameAtTime(canvas, context)` z obecnego renderera.
- [ ] Renderować klatki do `ImageData` albo PNG blobów.
- [ ] Kontrolować FPS: 24/30.
- [ ] Testować krótkie projekty 3–5 sekund.
- [ ] Nie renderować od razu długich klipów, bo pamięć przeglądarki może eksplodować.

## Etap C — ffmpeg.wasm proof of concept

- [ ] Dodać zależność ffmpeg.wasm dopiero po stabilnym renderze klatek.
- [ ] Załadować ffmpeg lazy-loadem tylko po kliknięciu MP4.
- [ ] Pokazać progress ładowania core.
- [ ] Wygenerować MP4 bez audio z sekwencji klatek.
- [ ] Zapisać wynik do IndexedDB render history.

## Etap D — audio mux

- [ ] Dodać audio jako wejście ffmpeg.
- [ ] Przyciąć audio do długości renderu.
- [ ] Zmuxować H.264/AAC lub fallback zależny od możliwości ffmpeg.wasm.
- [ ] Sprawdzić sync audio/video.

## Etap E — profile produkcyjne

### MP4 9:16

- Rozdzielczość: 1080×1920.
- FPS: 30.
- Długość startowa: max 30–60 s.
- Use case: TikTok, Reels, Stories.

### MP4 16:9

- Rozdzielczość: 1920×1080.
- FPS: 30.
- Długość startowa: max 60–180 s.
- Use case: YouTube, prezentacje, landing.

## Główne ryzyka

1. ffmpeg.wasm jest ciężki i wolny w przeglądarce.
2. Render klatek może zużyć dużo RAM.
3. MP4/AAC zależy od bundla ffmpeg.
4. Długie projekty mogą wymagać segmentacji.
5. Safari może mieć inne ograniczenia niż Chrome.

## Bezpieczna architektura

```txt
MediaRecorder WebM
  -> szybki preview
  -> krótkie eksporty
  -> obecny pipeline

ffmpeg.wasm MP4
  -> lazy loaded
  -> osobny render target
  -> krótkie proof of concept
  -> później produkcja
```

## Decyzja rekomendowana

Następny kodowy etap przed instalacją ffmpeg.wasm:

```txt
Extract deterministic frame renderer
```

Dopiero potem:

```txt
Add ffmpeg wasm MP4 proof of concept
```
