# FotoBeat Desktop

*English translation: see [README_EN.md](README_EN.md)*

FotoBeat Desktop to lokalna aplikacja pod marką FotoBeat.me do tworzenia filmów ze zdjęć i audio bez zależności od backendu SaaS. Ten produkt ma być narzędziem local-first: import mediów, analiza audio, timeline, eksport sekwencji/MP4 i później pełny lokalny render przez FFmpeg.

## Relacja do FotoBeat Web/SaaS

FotoBeat Desktop i FotoBeat Web/SaaS to dwa osobne produkty pod jedną marką:

- `KumatyTomi/FotoBeat` — aplikacja desktopowa i lokalny renderer,
- `KumatyTomi/FotoBeat---saas` — aplikacja webowa, backend, kolejki, storage, projekty użytkownika i późniejsze płatności.

Wspólne powinny być tylko kontrakty, format manifestu, nazewnictwo presetów i język marki. Kod runtime, release, storage i rendering mają być rozdzielone.

## Założenia Desktop

- lokalny import zdjęć i audio,
- lokalny project-engine: autosave, snapshoty, import/eksport `.fotobeat.json`,
- analiza audio i timeline sterowany beatem,
- frame sequence do PNG,
- ZIP z sekwencją klatek,
- MP4 POC przez `ffmpeg.wasm`,
- Electron shell,
- lokalna kolejka renderu zapisująca manifest/job status na dysku,
- później natywny FFmpeg i instalator Windows.

## Szybki start — renderer desktopowy

```bash
npm install
npm run dev
```

## Szybki start — Electron shell

Terminal 1, root repo:

```bash
npm install
npm run dev
```

Terminal 2:

```bash
cd desktop
npm install
npm run dev
```

## Build renderera

```bash
npm run build
npm run preview
```

## Struktura

```txt
src/
  components/     UI renderera desktopowego
  data/           presety efektów i formatów
  hooks/          project-engine, canvas, eksport, desktop bridge
  utils/          selekcja, rytm, render pipeline, eksport projektu

desktop/
  src/main.cjs        Electron main process
  src/preload.cjs     bezpieczny bridge do renderera
  src/renderQueue.cjs lokalne joby renderu i workspace na dysku

docs/             decyzje produktowe i techniczne
public/assets/    tła, ikony, sample i statyczne zasoby
```

## Status

To repo jest od teraz traktowane jako **FotoBeat Desktop**, a nie jako web/SaaS. Webowy produkt rozwijamy w `KumatyTomi/FotoBeat---saas`.

## Aktywny etap prac

Najbliższy etap to doprowadzenie Desktop do samodzielnego local-first MVP:

1. oddzielenie języka UI od SaaS,
2. utrwalenie formatu manifestu desktopowego,
3. zapis workspace render joba na dysku,
4. `render-plan.json` pod FFmpeg,
5. realny lokalny MP4.
