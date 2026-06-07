# FotoBeat.me

FotoBeat.me to aplikacja do tworzenia krótkich filmów ze zdjęć i pliku audio. Użytkownik wrzuca paczkę zdjęć oraz MP3, a aplikacja selekcjonuje kadry, dobiera efekty i buduje montaż zsynchronizowany z rytmem muzyki.

## Główne założenia

- dwa wejścia plików: zdjęcia oraz plik MP3,
- automatyczna selekcja zdjęć,
- timeline montażu pod beat,
- efekty wizualne: zoom, blur, fade, smoke, neon, glitch, matrix, sin-city,
- formaty eksportu: 16:9, 9:16 i square,
- później: render queue, autosave, snapshots, presety, szablony i panel projektów.

## Szybki start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Struktura

```txt
src/
  components/     UI aplikacji
  data/           presety efektów i formatów
  utils/          logika selekcji, rytmu i render pipeline
docs/             plan, roadmapa, prompty i notatki rozwojowe
public/assets/    miejsce na tła, ikony, sample i statyczne zasoby
```

## Status

To jest paczka startowa repozytorium: frontend/prototyp + dokumentacja projektowa. Backend/render video można dołożyć jako osobny moduł, np. Node + ffmpeg.wasm lub kolejka renderująca po stronie serwera.
