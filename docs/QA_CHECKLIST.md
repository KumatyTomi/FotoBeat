# FotoBeat.me — QA checklist

## Cel

Ta checklista służy do szybkiego sprawdzenia, czy obecny frontend nie złamał podstawowego pipeline:

1. upload zdjęć,
2. upload audio,
3. analiza audio,
4. timeline,
5. canvas preview,
6. WebM export,
7. IndexedDB render history.

## Smoke test po każdym większym commicie

### 1. Start aplikacji

- [ ] `npm install` przechodzi bez błędów.
- [ ] `npm run lint` przechodzi bez błędów.
- [ ] `npm run build` przechodzi bez błędów.
- [ ] `npm run dev` uruchamia Vite.
- [ ] Strona startowa renderuje hero i panele projektu.

### 2. Upload zdjęć

- [ ] Można wrzucić kilka zdjęć JPG/PNG/WEBP.
- [ ] Galeria pokazuje miniatury.
- [ ] Każde zdjęcie dostaje status `ready`.
- [ ] Orientacja zdjęć jest wykrywana jako `portrait`, `landscape` albo `square`.
- [ ] Można zaznaczać/odznaczać zdjęcia.
- [ ] Nie da się odznaczyć wszystkich zdjęć naraz, jeśli timeline wymaga minimum jednego aktywnego kadru.

### 3. Timeline control

- [ ] Przyciski góra/dół zmieniają kolejność aktywnych kadrów.
- [ ] Przypięcie zdjęcia do aktualnego klipu działa.
- [ ] Odpinanie aktualnego klipu działa.
- [ ] Canvas respektuje przypięcie przed automatyczną kolejnością.

### 4. Audio analysis

- [ ] Można wrzucić MP3/WAV.
- [ ] Panel audio pokazuje BPM.
- [ ] Panel audio pokazuje energię.
- [ ] Waveform jest widoczny.
- [ ] Beat markers są widoczne na waveform.
- [ ] Dla wyraźnego utworu `analysisMode` powinien preferować `transient`.
- [ ] Dla trudnego utworu fallback nie blokuje pracy aplikacji.

### 5. Canvas preview

- [ ] Canvas renderuje animowany preview.
- [ ] Format 16:9 działa.
- [ ] Format 9:16 działa.
- [ ] Format 1:1 działa.
- [ ] Zmiana presetu wpływa na styl preview.
- [ ] Zmiana korekty długości klipów wpływa na timeline.

### 6. Projekt JSON

- [ ] Autosave zapisuje zmiany projektu.
- [ ] Snapshot tworzy wpis w liście snapshotów.
- [ ] Eksport `.fotobeat.json` pobiera plik.
- [ ] Kopiowanie JSON do schowka działa.
- [ ] Import JSON waliduje schemat.
- [ ] Import mapuje media po ID albo nazwie pliku.

### 7. WebM export

- [ ] Eksport WebM bez audio działa.
- [ ] Eksport WebM z audio działa.
- [ ] Po eksporcie pojawia się element w render queue.
- [ ] Link pobierania WebM działa.
- [ ] Rozmiar pliku jest pokazany.
- [ ] Status audio/video jest poprawny.

### 8. Persistent render history

- [ ] Eksport zapisany lokalnie pokazuje status `zapisane lokalnie`.
- [ ] Po odświeżeniu strony historia eksportów wraca.
- [ ] Pobieranie po odświeżeniu działa.
- [ ] Usunięcie eksportu usuwa go z UI i IndexedDB.
- [ ] Czyszczenie historii usuwa wszystkie eksporty.

## Regression checklist przed MP4 / ffmpeg.wasm

- [ ] `useCanvasRecorder` nadal działa po refactorach.
- [ ] `renderStorage.js` nie przechowuje pustych Blobów.
- [ ] `audioAnalysis.js` nie blokuje UI na długich plikach audio.
- [ ] `canvasRenderer.js` jest niezależny od React.
- [ ] `timeline.js` nie miesza modelu danych z UI.
- [ ] `projectExport.js` nie eksportuje binarnych danych zdjęć/audio.

## Znane ograniczenia

- WebM export jest ograniczony do 30 sekund.
- MP4 nie jest jeszcze wdrożone.
- ffmpeg.wasm nie jest jeszcze zależnością projektu.
- Historia WebM jest lokalna dla danej przeglądarki.
- Dane z IndexedDB mogą zostać skasowane przez przeglądarkę albo użytkownika.
