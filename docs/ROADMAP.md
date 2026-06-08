# FotoBeat.me — roadmapa techniczna

## Etap 1: Repo i baza frontendowa

- [x] Vite + React
- [x] UI landing/editor
- [x] upload zdjęć
- [x] upload audio
- [x] roboczy timeline
- [x] presety efektów
- [x] dokumentacja startowa

## Etap 2: Projekt użytkownika

- [x] model `Project` w stanie aplikacji
- [x] autosave w localStorage
- [x] eksport projektu jako JSON do schowka
- [x] snapshot wersji timeline
- [x] eksport decyzji timeline do JSON
- [ ] import projektu JSON z pliku
- [ ] panel listy projektów

## Etap 3: Analiza plików

- [x] miniatury zdjęć przez object URL
- [x] wykrywanie orientacji zdjęć
- [x] prosty scoring jakości i zgodności z formatem
- [ ] ocena ostrości
- [ ] podstawowa detekcja duplikatów
- [x] odczyt długości audio przez Web Audio API
- [x] szacowanie energii audio
- [ ] waveform preview

## Etap 4: Beat engine

- [x] robocza beat mapa na podstawie BPM
- [x] wykrycie sekcji timeline: intro, build, drop, outro
- [x] energia audio jako parametr efektów
- [x] automatyczne cięcia według beat grid
- [ ] realna detekcja transientów zamiast heurystyki BPM
- [ ] ręczna korekta długości klipów

## Etap 5: Render

- [x] render preview w canvas
- [x] animacja `requestAnimationFrame`
- [x] HUD renderu: format, czas, aktualny klip
- [x] style canvas dla 16:9, 9:16 i 1:1
- [x] preview na realnych zdjęciach z uploadu
- [x] ręczna selekcja aktywnych kadrów do timeline
- [x] ręczna kolejność kadrów na timeline
- [x] przypinanie zdjęcia do konkretnego klipu
- [ ] ffmpeg.wasm proof of concept
- [ ] eksport MP4 9:16
- [ ] eksport MP4 16:9
- [ ] render queue

## Etap 6: Produkt

- [ ] logowanie
- [ ] dashboard użytkownika
- [ ] historia eksportów
- [ ] presety premium
- [ ] płatności
- [ ] landing sprzedażowy

## Najbliższy następny duży krok

Project import/export upgrade: dodać import projektu JSON z pliku, eksport jako plik `.fotobeat.json` oraz walidację zgodności projektu z aktualnie wrzuconymi mediami. Po tym można wejść w ffmpeg.wasm proof of concept.
