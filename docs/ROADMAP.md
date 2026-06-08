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
- [ ] import projektu JSON z pliku
- [ ] panel listy projektów

## Etap 3: Analiza plików

- [ ] miniatury zdjęć
- [ ] wykrywanie orientacji zdjęć
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
- [ ] ręczna korekta timeline

## Etap 5: Render

- [x] render preview w canvas
- [x] animacja `requestAnimationFrame`
- [x] HUD renderu: format, czas, aktualny klip
- [x] style canvas dla 16:9, 9:16 i 1:1
- [ ] preview na realnych miniaturach zdjęć
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

Media pipeline: wygenerować miniatury z wrzuconych zdjęć, trzymać je jako obiekty URL, rysować aktualny kadr na canvas i dodać ręczny wybór zdjęć do timeline. Dopiero po tym warto robić eksport MP4.
