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
- [x] eksport projektu jako plik `.fotobeat.json`
- [x] import projektu JSON z pliku
- [x] snapshot wersji timeline
- [x] eksport decyzji timeline do JSON
- [x] walidacja i remap mediów po imporcie
- [ ] panel listy projektów

## Etap 3: Analiza plików

- [x] miniatury zdjęć przez object URL
- [x] wykrywanie orientacji zdjęć
- [x] prosty scoring jakości i zgodności z formatem
- [ ] ocena ostrości
- [ ] podstawowa detekcja duplikatów
- [x] odczyt długości audio przez Web Audio API
- [x] szacowanie energii audio
- [x] waveform preview

## Etap 4: Beat engine

- [x] robocza beat mapa na podstawie BPM
- [x] wykrycie sekcji timeline: intro, build, drop, outro
- [x] energia audio jako parametr efektów
- [x] automatyczne cięcia według beat grid
- [x] wizualny beat grid na waveform
- [x] ręczna korekta długości klipów przez `clipDurationScale`
- [ ] realna detekcja transientów zamiast heurystyki BPM

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

ffmpeg.wasm proof of concept: przygotować pierwszy eksperymentalny eksport MP4 z canvas/timeline albo dodać prosty render klatek do sekwencji. Alternatywa przed eksportem: realniejsza detekcja transientów i scoring ostrości zdjęć.
