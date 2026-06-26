# FotoBeat cosmic panel patch

Wgraj zawartość folderu `src/` do repozytorium `KumatyTomi/FotoBeat`, nadpisując istniejące pliki.

Zmiany:
- cztery przyciski w topbarze przełączają interaktywne panele: Start, Studio, Render, Admin;
- dodany `ModePanel.jsx` z realną zawartością per panel;
- dodane realistyczne przejścia: liquid gate, ripple, crossfade, motion blur;
- grafiki referencyjne są osadzone w `src/cosmic-panels.css` jako WebP data URI;
- JSON/import/export/diagnostyka są ukryte poza trybem Admin/debug;
- tryb Admin pokazuje techniczne opcje.

Po wgraniu uruchom:

```bash
npm install
npm run build
cd desktop
npm install
npm run dist
```
