# FotoBeat Engine – Plan implementacji

**Nazwa:** FotoBeat Engine  
**Filozofia:** Całkowicie ukryty moduł – zero UI, zero widocznych plików poza contracts. Działa wyłącznie w tle jako czarna skrzynka.

## 1. Wejście
- Obowiązkowe: ścieżka do pliku audio (MP3, WAV, FLAC)
- Opcjonalne: przybliżony BPM, metrum, gatunek muzyczny
- Parametry: sample rate (domyślnie 22050 Hz), chunk length 30s

## 2. Wyjście
- Dokładny JSON zgodny z contracts/project.v1 i contracts/fotobeat.render.v1
- Pola: beats[], estimatedBPM, timeSignature, duration, modelVersion, processingTime
- Opcjonalnie: sections[] (intro, drop, bridge, outro) z per-section BPM

## 3. Architektura modelu
- Frontend: 2D conv stem + 3 bloki partial frequency-time transformer (rotary embedding + sigmoid gating)
- Główny transformer: 6 bloków RoFormer (512-dim, 16 głów po 32 dim, sigmoid gate per head, FFN 2048)
- Głowy wyjściowe: dwie niezależne (beat + downbeat) lub summed head
- Wejście: log-mel spectrogram 128 pasm, 25-50 fps, chunki po 30 s (1500 ramek)
- Strata: max-pooling tolerant (szerokość 7 ramek) + BCE, toleruje ±3 ramki przesunięcia anotacji

## 4. Multi-czujnikowy system detekcji
Zwiększamy liczbę czujników z 2 do 12 głównych:
- Klasyczne onsety
- Spectral flux
- Percussive separation
- Harmonic content
- Bass energy
- High-mid transients
- RMS envelope
- Zero-crossing rate
- Chroma change
- MFCC delta
- Phase vocoder flux
- Drum-specific filterbank

Każdy czujnik dostaje 8-12 równoległych wskaźników (różne okna czasowe, progi, filtry) – razem ponad 100 strumieni sygnału. Ensemble voting z wagami uczonymi end-to-end.

## 5. Synchronizacja obrazu z dźwiękiem
Silnik zwraca nie tylko timestampy, ale też per-beat event tags: kick, snare, hi-hat, bass drop, vocal hit. Na tej podstawie aplikacja automatycznie przypisuje efekty wizualne:
- Mocny kick = mocny zoom/punch
- Snare = szybki cut lub shake
- Hi-hat = subtelny grain lub flicker
Timeline w projekcie dostaje dodatkowe pola effectType i intensity, więc render FFmpeg wie dokładnie, jaki efekt odpalić w danej klatce.

## 6. Trening i dane
- Wszystkie datasety z paperu "Beat This!"
- Własne dane z TikToka i Instagram Reels
- Loss: max-pooling tolerant + BCE

## 7. Integracja z aplikacją
- Moduł Rust/FFI lub WASM
- Wywoływany w tle przed renderem
- Zapisuje wynik prosto do timeline projektu
- Zero widocznych plików dla użytkownika

## 8. Kolejne kroki
1. Zdefiniować dokładny schemat JSON wyjściowy
2. Przygotować pipeline ekstrakcji cech
3. Zbudować i przetestować model bazowy
4. Zintegrować z desktopową aplikacją
5. Zebrać własne dane treningowe

**Wersja planu:** 1.0  
**Data:** 2026-07-18