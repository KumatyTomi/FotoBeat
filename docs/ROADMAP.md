# FotoBeat.me Desktop — autorska roadmapa

**Autor:** Rafał Zalewski / @zalson  
**Repo:** `KumatyTomi/FotoBeat`  
**Kierunek:** lokalna aplikacja desktopowa do montażu klipów ze zdjęć i muzyki, z naciskiem na szybki workflow, mocny wizual, render lokalny i eksport pod social/video.

## 0. Zasoby repo — aktualny przegląd

### Frontend i shell

- `src/App.jsx` — główny orkiestrator aplikacji: projekt, upload, audio, timeline, preview, eksporty i desktop render.
- `src/components/shell/` — desktopowy shell aplikacji: topbar, lewy rail, centralny workspace, prawy drawer i dolna kolejka.
- `src/components/shell/RightDrawer.jsx` — praktyczne rozwijane boczne slidery oraz realne kontrolki Veil Layer.
- `src/components/shell/VeilLayer.jsx` — ambient background layer dla video/image z Imagine.
- `src/components/shell/VisualSphere.jsx` — lekka sfera wizualna zsynchronizowana z Veil Layer.
- `src/hooks/useProfile.js` — profile trybów pracy: `Create`, `Studio`, `Beat Lab`, `Inspect`.
- `src/main.jsx` — główne wejście React, importujące warstwy CSS, w tym `premium-cockpit.css`, `pragmatic-side-sliders.css`, `visual-sphere.css` i `veil-layer.css`.

### Warstwa wizualna

- `src/styles.css` — bazowy wygląd aplikacji.
- `src/single-shell.css` — układ single-shell: topbar, rail, drawer, center workspace, bottom queue.
- `src/vajra-override.css` — wcześniejsza warstwa neon/glass override.
- `src/premium-cockpit.css` — aktualna warstwa cockpit UI w stylu premium: ciemne szkło, cyan/violet/magenta, amber render status, lepsze panele i kolejka.
- `src/pragmatic-side-sliders.css` — boczne rozwijane slidery i skróty do praktycznych funkcji.
- `src/visual-sphere.css` — atrakcyjna sfera wizualna: aura, glass core, orbit rings, particles i reduced-motion fallback.
- `src/veil-layer.css` — ambient video/image background, fallback gradient, blur/saturation/opacity i kontrolki Veil Layer.

### State i konfiguracja UI

- `src/stores/guiStore.js` — Zustand persist dla profilu, paneli oraz `veilLayer`.
- `veilLayer.enabled` — włączenie/wyłączenie ambient layer.
- `veilLayer.sourceUrl` — URL video lub obrazu z Imagine.
- `veilLayer.sourceType` — `video` albo `image`.
- `veilLayer.opacity`, `blur`, `saturation`, `speed`, `reactivity` — parametry oprawy Phantom.
- `veilLayer.sphereSync` — synchronizacja sfery z intensywnością Veil Layer.

### Media, audio i timeline

- `src/hooks/useMediaAssets.js` — tworzy assety zdjęć, miniatury, selekcję, kolejność i przypięcia do klipów.
- `src/utils/mediaScoring.js` — scoring zdjęć względem formatu oraz rozwiązywanie zdjęcia dla klipu.
- `src/utils/mediaAssetState.js` — testowalna logika stabilnych ID, merge selekcji i czyszczenia pinów.
- `src/hooks/useAudioAnalysis.js` — stan analizy audio dla wrzuconego pliku.
- `src/utils/audioAnalysis.js` — waveform, energy windows, transient beat detection, fallback beat map i szacowanie BPM.

### Render i eksport

- `src/utils/canvasRenderer.js` — deterministic frame renderer / canvas render logic.
- `src/components/DesktopRenderPanel.jsx` — panel renderu desktopowego, status FFmpeg, folder eksportu, job, historia.
- `src/components/DesktopRenderHistory.jsx` — historia renderów desktopowych.
- `src/components/Mp4ProfileSelector.jsx` — wybór profili MP4.
- Istniejące ścieżki eksportu: PNG frame, frame sequence, ZIP frames, WebM, MP4 POC, desktop render job.

### Desktop / Electron

- `desktop/package.json` — konfiguracja Electron i electron-builder.
- `desktop/src/main.cjs` — start procesu desktopowego.
- `desktop/src/windowFactory.cjs` — okno aplikacji i ładowanie zbudowanego web UI.
- `desktop/src/preload.cjs` — bridge między rendererem a desktop API.
- `desktop/src/renderQueue.cjs` — lokalna kolejka renderów.
- `desktop/src/jobHistory.cjs` — historia jobów.
- `desktop/src/pathSafety.cjs` — ograniczenia bezpiecznych ścieżek lokalnych.

### CI/CD i instalator

- `.github/workflows/ci.yml` — główne CI.
- `.github/workflows/windows-installer.yml` — budowa instalatora Windows.
- `scripts/ci-deps.mjs` — instalacja zależności w workflow bez zależności od lockfile.
- `scripts/assert-electron-assets.mjs` — smoke check assetów po Vite buildzie, żeby packaged Electron nie ładował absolutnych `/assets/...` przez `file://`.
- `tests/mediaAssetState.node.mjs` — natywny test Node dla stabilnej selekcji mediów i pinów.

## 1. Stan obecny

### Repo i baza frontendowa

- [x] Vite + React
- [x] UI landing/editor
- [x] desktop single-shell layout
- [x] profile pracy: Create / Studio / Beat Lab / Inspect
- [x] premium cockpit visual layer
- [x] praktyczne boczne slidery dla koniecznych funkcji
- [x] Veil Layer dla ambient video/image z Imagine
- [x] Visual Sphere zsynchronizowana z Veil Layer
- [x] upload zdjęć
- [x] upload audio
- [x] roboczy timeline
- [x] presety efektów
- [x] dokumentacja startowa
- [x] GitHub Actions CI
- [x] Windows Installer workflow
- [x] Vite `base: './'` dla packaged Electron
- [x] smoke check assetów Electron przed pakowaniem instalatora

### Projekt użytkownika

- [x] model `Project` w stanie aplikacji
- [x] autosave w localStorage
- [x] eksport projektu jako JSON do schowka
- [x] eksport projektu jako plik `.fotobeat.json`
- [x] import projektu JSON z pliku
- [x] snapshot wersji timeline
- [x] eksport decyzji timeline do JSON
- [x] walidacja/remap mediów po imporcie
- [ ] panel listy projektów
- [ ] trwała biblioteka projektów lokalnych
- [ ] czytelny ekran brakujących mediów po imporcie projektu

### Media i analiza plików

- [x] miniatury zdjęć przez object URL
- [x] wykrywanie orientacji zdjęć
- [x] scoring jakości i zgodności z formatem
- [x] ręczna selekcja aktywnych kadrów
- [x] ręczna kolejność kadrów
- [x] przypinanie zdjęcia do konkretnego klipu
- [x] odczyt długości audio przez Web Audio API
- [x] waveform preview
- [x] wykrywanie transientów jako upgrade beat mapy
- [x] stabilne media ID bez indeksu jako części tożsamości
- [x] dodawanie nowych zdjęć bez resetu selekcji i przypięć
- [x] test zachowania selekcji i pinned clips po dodaniu zdjęć
- [ ] ocena ostrości zdjęć
- [ ] pełny media quality report w UI

### Beat engine

- [x] robocza beat mapa na podstawie BPM/fallback
- [x] transient beat detection
- [x] energia audio jako parametr efektów
- [x] wizualny beat grid na waveform
- [x] ręczna korekta długości klipów przez `clipDurationScale`
- [ ] Beat Director jako realny panel sterowania decyzjami cięć
- [ ] wykrywanie sekcji utworu: intro / build / drop / outro w UI
- [ ] intensywność montażu jako jeden suwak: spokojnie / dynamicznie / agresywnie

### Render i eksport

- [x] render preview w canvas
- [x] HUD renderu: format, czas, aktualny klip
- [x] style canvas dla 16:9, 9:16 i 1:1
- [x] testowy eksport pojedynczej klatki PNG
- [x] frame sequence renderer
- [x] frame sequence ZIP export
- [x] WebM proof of concept
- [x] WebM z audio track przez Web Audio API
- [x] render job model i historia
- [x] ffmpeg command builder / MP4 plan foundation
- [x] MP4 POC
- [x] desktop render panel
- [ ] produkcyjny MP4 9:16
- [ ] produkcyjny MP4 16:9
- [ ] Export Hub wybierający najlepszą ścieżkę: Native MP4 → MP4 POC → WebM → ZIP frames
- [ ] cover frame generator
- [ ] warianty renderu: clean / hard beat / cinematic

### Desktop / instalator

- [x] Electron wrapper
- [x] desktop bridge
- [x] local output folder picker
- [x] FFmpeg status/readiness w panelu desktopowym
- [x] Windows NSIS installer przez electron-builder
- [x] workflow Windows Installer
- [x] smoke check assetów dla packaged app
- [ ] podpisywanie instalatora
- [ ] wersjonowanie release `v0.x.x`
- [ ] GitHub Release z instalatorem zamiast wyłącznie artifact z Actions
- [ ] auto-update lub przynajmniej jasna ścieżka aktualizacji

## 2. Autorski kierunek produktu

FotoBeat.me Desktop ma nie być kolejnym panelem narzędziowym. Docelowy feeling:

1. użytkownik wrzuca zdjęcia,
2. wrzuca muzykę,
3. aplikacja pokazuje puls utworu,
4. wybiera styl montażu,
5. widzi żywy preview,
6. eksportuje klip bez myślenia o technicznych ścieżkach renderu.

Główne doświadczenie:

```txt
Import → Beat Map → Style DNA → Veil Layer → Timeline → Preview → Export
```

Tryby pracy:

- **Create** — szybkie tworzenie klipu, minimalna liczba decyzji.
- **Studio** — pełna kontrola timeline, presetów, mediów, Veil Layer i eksportów.
- **Beat Lab** — rytm, transienty, drop markers, cięcia i energia.
- **Inspect** — manifesty, joby, ścieżki, logi, debug i walidacja.

## 3. Najbliższe priorytety

### P0 — stabilność i brak utraty pracy

1. Zweryfikować świeży installer po Veil Layer.
2. Dopiąć panel brakujących mediów po imporcie projektu.
3. Utrzymać testy media state w CI.

### P1 — premium experience bez burzenia silnika

1. Podpiąć Veil Layer pod realne pliki z Imagine zamiast ręcznego URL.
2. Podpiąć boczne slidery pod realne dane zamiast statycznych poziomów.
3. Zbudować `ExportReadiness` na podstawie audio/media/render/desktop status.
4. Zbudować `Style DNA` jako rozszerzenie `EFFECT_PRESETS`.
5. Zbudować `Beat Director` jako warstwę nad `audioAnalysis` i timeline.

### P2 — produkcyjny output

1. Produkcyjny MP4 9:16.
2. Produkcyjny MP4 16:9.
3. Cover frame generator.
4. Warianty renderu.
5. GitHub Release z instalatorem.

## 4. Następny rekomendowany commit

```txt
feat(veil): bind veil layer to imported Imagine media
```

Zakres:

- wykrywać importowane video/image jako kandydatów Veil Layer,
- wybierać aktywny ambient asset z biblioteki projektu,
- przełączać Veil Layer automatycznie w Flow Mode,
- synchronizować reactivity z energią audio,
- dodać eksport ustawień Veil Layer do `.fotobeat.json`.
