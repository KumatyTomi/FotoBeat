# FotoBeat Desktop

[![CI](https://github.com/KumatyTomi/FotoBeat/actions/workflows/ci.yml/badge.svg)](https://github.com/KumatyTomi/FotoBeat/actions/workflows/ci.yml)

FotoBeat Desktop to lokalna aplikacja pod marka FotoBeat.me do tworzenia filmow ze zdjec i audio bez zaleznosci od backendu SaaS. Produkt jest rozwijany jako narzedzie local-first: import mediow, analiza audio, timeline sterowany rytmem, eksport sekwencji klatek oraz lokalny render MP4 przez FFmpeg.

## Produkt w skrocie

**Wrzuć zdjęcia i muzykę. FotoBeat układa klip w rytm bitu, a desktopowy renderer trzyma projekt i render lokalnie.**

Repozytorium pokazuje kierunek techniczny produktu desktopowego: React/Vite jako renderer UI, Electron jako shell, lokalna kolejka renderowania, kontrakty manifestow oraz plan przejscia z POC do natywnego FFmpeg.

## Co jest zaimplementowane

- desktopowy renderer UI w React,
- Electron shell z bezpiecznym preload bridge,
- lokalna kolejka render jobow zapisywana na dysku,
- manifest/render plan dla eksportu,
- historia renderow i kontrolki retry/cancel,
- POC eksportu sekwencji/MP4,
- CI dla lint/build oraz smoke check pakowania desktopu,
- dokumentacja decyzji produktowych, roadmapy i etapow render pipeline.

## Relacja do FotoBeat Web/SaaS

FotoBeat Desktop i FotoBeat Web/SaaS to dwa osobne produkty pod jedna marka:

- `KumatyTomi/FotoBeat` - aplikacja desktopowa i lokalny renderer,
- `KumatyTomi/FotoBeat---saas` - aplikacja webowa, backend, kolejki, storage, projekty uzytkownika i pozniejsze platnosci.

Wspolne powinny byc tylko kontrakty, format manifestu, nazewnictwo presetow i jezyk marki. Kod runtime, release, storage i rendering sa rozdzielone.

## Stack

- React 19
- Vite 7
- Electron
- Zustand
- Radix UI
- FFmpeg / ffmpeg.wasm
- GitHub Actions

## Szybki start - renderer desktopowy

```bash
npm install
npm run dev
```

## Szybki start - Electron shell

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

## Build i kontrola jakosci

```bash
npm run lint:strict
npm run build
npm run preview
```

Desktop smoke check jest uruchamiany w CI przez workflow `.github/workflows/ci.yml`.

## Struktura

```txt
src/
  components/     UI renderera desktopowego
  data/           presety efektow i formatow
  hooks/          project-engine, canvas, eksport, desktop bridge
  stores/         stan UI i preferencji
  utils/          selekcja, rytm, render pipeline, eksport projektu

desktop/
  src/main.cjs                 Electron main process
  src/preload.cjs              bezpieczny bridge do renderera
  src/renderQueue.cjs          lokalne joby renderu i workspace na dysku
  src/nativeFfmpegRenderer.cjs natywny renderer FFmpeg
  src/renderPlan.cjs           plan renderowania dla eksportu

docs/             decyzje produktowe i techniczne
public/assets/    tla, ikony, sample i statyczne zasoby
```

## Status

To repo jest traktowane jako **FotoBeat Desktop**, a nie jako web/SaaS. Webowy produkt rozwijamy w `KumatyTomi/FotoBeat---saas`.

Najblizszy etap to doprowadzenie Desktop do samodzielnego local-first MVP:

1. domkniecie formatu manifestu desktopowego,
2. stabilny zapis workspace render joba na dysku,
3. `render-plan.json` pod FFmpeg,
4. realny lokalny MP4,
5. demo wideo/screenshoty do README.

## Portfolio notes

Repo jest przygotowywane tak, aby dalo sie szybko ocenic produkt i warsztat techniczny. Najwazniejsze sygnaly jakosci to czytelne README, przypiete wersje zaleznosci, CI, brak wrzucanych paczek ZIP oraz dokumenty architektoniczne w `docs/`.
