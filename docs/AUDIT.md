# FotoBeat.me — audyt techniczny

Data audytu: 2026-06-08
Repo: `KumatyTomi/FotoBeat`
Branch: `main`

## Ocena ogólna

Projekt ma już solidny prototyp funkcjonalny: upload zdjęć/audio, lokalny projekt, autosave, import/eksport JSON, timeline, canvas preview, waveform, beat grid, scoring i ręczną kontrolę kadrów. Największy problem nie jest funkcjonalny, tylko architektoniczny: za dużo logiki znajduje się w `src/App.jsx`.

Aktualny stan nadaje się jako prototyp/demo, ale przed wejściem w eksport video, ffmpeg.wasm albo dalsze funkcje trzeba wykonać refactor.

## Krytyczne ryzyka

### 1. `App.jsx` jest monolitem

W jednym pliku znajdują się jednocześnie:

- stan projektu,
- upload mediów,
- object URL cleanup,
- analiza audio,
- waveform,
- canvas renderer,
- import/eksport projektu,
- scoring zdjęć,
- kontrola timeline,
- JSX całej aplikacji,
- helpery renderowania canvas.

Ryzyko:

- trudne debugowanie,
- rosnąca szansa regresji przy każdym następnym etapie,
- trudny podział pracy,
- brak możliwości testowania modułów osobno,
- trudniejszy eksport video, bo renderer nie jest odseparowany.

Rekomendacja: następny etap powinien być refactorem, nie kolejną funkcją.

### 2. Brak realnej automatycznej kontroli jakości

`package.json` ma skrypty `dev`, `build`, `preview` i `lint`, ale repo nie ma aktywnego workflow CI widocznego w `.github/workflows/ci.yml`.

Ryzyko:

- brak potwierdzenia, że build przechodzi,
- status checks nie raportują wyników,
- można commitować kod z błędami runtime/syntax,
- lint może nie działać bez konfiguracji ESLint.

Rekomendacja:

- dodać `.github/workflows/ci.yml`,
- dodać `eslint.config.js`,
- dodać `npm run build` i `npm run lint` do CI,
- dodać `npm ci`, najlepiej po wygenerowaniu `package-lock.json`.

### 3. Brak podziału na moduły domenowe

Projekt ma już kilka naturalnych domen:

- `project` — autosave/import/export/snapshoty,
- `media` — upload, object URL, scoring, orientacja,
- `audio` — decode, waveform, beat grid,
- `timeline` — klipy, sekcje, korekta długości,
- `render` — canvas preview i późniejszy eksport,
- `ui` — panele i komponenty.

Te domeny powinny mieć osobne pliki.

Proponowana struktura:

```txt
src/
  components/
    ProjectPanel.jsx
    MediaPanel.jsx
    AudioPanel.jsx
    RenderPreview.jsx
    TimelinePreview.jsx
  hooks/
    useProjectState.js
    useMediaAssets.js
    useAudioAnalysis.js
    useCanvasPreview.js
  utils/
    projectExport.js
    mediaScoring.js
    audioAnalysis.js
    canvasRenderer.js
    timeline.js
```

### 4. Eksport video nie powinien być kolejną funkcją bez refactoru

ffmpeg.wasm albo MediaRecorder dołożone teraz do `App.jsx` jeszcze bardziej powiększą monolit. Najpierw trzeba wydzielić renderer canvas i model timeline.

Rekomendowana kolejność:

1. Refactor `App.jsx`.
2. CI + lint.
3. Stabilizacja import/export.
4. MediaRecorder/WebM proof of concept.
5. Dopiero potem ffmpeg.wasm/MP4.

## Problemy techniczne średniego ryzyka

### 5. Waveform i beat detection są heurystyczne

Aktualnie BPM jest szacowane uproszczoną regułą na podstawie średniej energii. To wystarcza do demo, ale nie jest rzeczywistą detekcją beatów.

Rekomendacja:

- wykrywać transienty lokalnymi maksimami energii,
- normalizować energię po oknach,
- dodać próg adaptacyjny,
- wyprowadzić `audioAnalysis.js`.

### 6. Import projektu mapuje media po ID albo nazwie

To dobre jako MVP, ale ID zawiera `lastModified`, rozmiar i indeks, więc po ponownym wrzuceniu tych samych plików ID może się nie zgodzić. Fallback po nazwie pomoże, ale może dać błędne dopasowanie przy duplikatach nazw.

Rekomendacja:

- dodać `fingerprint`: `name + size + type`,
- wykrywać kolizje nazw,
- pokazywać listę niedopasowanych mediów po imporcie.

### 7. Object URL cleanup jest dobry, ale media state jest resetowany po każdej zmianie zdjęć

Aktualnie zmiana listy plików resetuje `selectedAssetIds` i `pinnedAssetsByClip`. To jest poprawne dla prostego MVP, ale docelowo będzie irytujące, jeśli użytkownik doda jedno zdjęcie do istniejącego projektu.

Rekomendacja:

- merge nowych plików zamiast pełnego resetu,
- zachować selekcję i przypięcia istniejących assetów,
- usuwać tylko assety, których faktycznie nie ma.

### 8. `localStorage` nie przechowuje plików

Projekt zapisuje ustawienia, ale nie binarne zdjęcia/audio. To jest prawidłowe, ale UX musi jasno komunikować, że po imporcie trzeba ponownie wrzucić media.

Rekomendacja:

- komunikat przy imporcie: „Najpierw wrzuć zdjęcia/audio, potem importuj projekt”,
- panel brakujących mediów.

## Problemy UX/UI

### 9. Import JSON w labelu z inputem wygląda technicznie

Działa, ale UX będzie średni. Docelowo trzeba zrobić osobny, czytelny przycisk i status importu.

### 10. Brak podglądu przypięć bezpośrednio na timeline

Przypięcia widać w panelu mediów i canvas, ale timeline powinien pokazywać, który klip ma przypięte zdjęcie.

### 11. Brak kontroli kolejności klipów na samym timeline

Obecnie sortowanie jest w media grid. Docelowo timeline powinien mieć tryb edycji.

## Bezpieczeństwo i prywatność

### 12. Aplikacja działa lokalnie w przeglądarce

To dobry kierunek dla MVP, bo zdjęcia i audio nie są wysyłane na serwer. Trzeba to zachować jako przewagę produktu.

### 13. Eksport JSON nie zawiera binarnych danych

To również jest poprawne. JSON zawiera metadane i decyzje montażowe, nie pliki.

## Priorytety napraw

### P0 — przed dalszym rozwojem

1. Dodać CI.
2. Dodać konfigurację ESLint.
3. Rozbić `App.jsx` na moduły.
4. Wydzielić `canvasRenderer.js`.
5. Wydzielić `audioAnalysis.js`.

### P1 — przed eksportem video

1. Ustabilizować model projektu.
2. Dodać typy danych albo JSDoc.
3. Dodać panel brakujących mediów po imporcie.
4. Dodać render status.
5. Zrobić MediaRecorder/WebM proof of concept.

### P2 — po proof of concept

1. Realniejsza detekcja transientów.
2. Scoring ostrości zdjęć.
3. Duplikaty zdjęć.
4. Drag & drop timeline.
5. ffmpeg.wasm / MP4.

## Rekomendowany następny commit

Nie dodawać jeszcze ffmpeg.wasm. Najpierw zrobić commit:

```txt
Refactor App into project media audio and render modules
```

Zakres tego commita:

- `src/hooks/useProjectState.js`,
- `src/hooks/useMediaAssets.js`,
- `src/hooks/useAudioAnalysis.js`,
- `src/utils/canvasRenderer.js`,
- `src/utils/projectExport.js`,
- `src/utils/mediaScoring.js`,
- `src/components/ProjectPanel.jsx`,
- `src/components/MediaPanel.jsx`,
- `src/components/AudioPanel.jsx`,
- `src/components/RenderPreview.jsx`.

Po tym repo będzie gotowe na eksport video bez robienia bałaganu.
