# Work log

## 2026-06-08 — Frame sequence ZIP export

Commits wykonane w tym etapie:

- `b94eb7e` — dodany `zipExport.js`: ZIP builder bez zależności npm, z CRC32 i central directory.
- `5998d72` — dodany `useFrameSequenceZipExporter`.
- `2211970` — UI frame sequence dostało przyciski `Spakuj ZIP` i `Pobierz ZIP`.
- `726628d` — ESLint dostał global `TextEncoder`.
- `b75d14e` — roadmapa oznacza frame sequence ZIP export jako wykonany.
- `e14ab14` — masterplan 100 etapów zaktualizowany po ZIP export.

## Zakres funkcjonalny

- Zapisane sekwencje PNG można spakować do ZIP bez dodawania zależności npm.
- ZIP używa trybu `store`, czyli bez kompresji, ale z poprawnym CRC32.
- Paczka zawiera klatki w strukturze:

```txt
frames/frame_0001.png
frames/frame_0002.png
frames/frame_0003.png
```

- Paczka zawiera `manifest.json` z metadanymi sekwencji.
- UI pozwala zbudować ZIP dla wybranej sekwencji i pobrać plik.
- To przygotowuje wejście dla ffmpeg.wasm, gdzie klatki muszą mieć stabilne nazwy.

## Ograniczenia

- ZIP nie kompresuje danych, bo PNG i tak jest już skompresowany.
- Brak jeszcze ffmpeg.wasm.
- Brak jeszcze MP4.

## Następny rekomendowany etap

Lazy-load ffmpeg.wasm: dodać zależności, ładować core dopiero po kliknięciu MP4, pokazać progress i wygenerować pierwszy MP4 bez audio z zapisanej sekwencji PNG.
