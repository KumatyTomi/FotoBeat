# FotoBeat — rozdział produktów

## Decyzja

FotoBeat ma dwa osobne produkty pod jedną marką:

1. **FotoBeat Desktop** — local-first aplikacja do tworzenia i renderowania filmów na komputerze użytkownika.
2. **FotoBeat Web/SaaS** — aplikacja webowa z backendem, kontami, storage, render queue i późniejszym billingiem.

To nie są warianty tej samej aplikacji. To dwa różne twory z osobnym runtime, release cycle i architekturą.

## Repozytoria

| Repo | Produkt | Odpowiedzialność |
|---|---|---|
| `KumatyTomi/FotoBeat` | FotoBeat Desktop | Electron, local-first project engine, lokalne pliki, lokalny render, instalator |
| `KumatyTomi/FotoBeat---saas` | FotoBeat Web/SaaS | React web, FastAPI/backend, storage, kolejki, API, użytkownicy, deploy |

## Wspólne elementy marki

Wspólne zostają:

- nazwa FotoBeat / FotoBeat.me,
- styl: beat, montage, neon, smoke, club, cinematic,
- format manifestu na poziomie koncepcyjnym,
- nazwy presetów,
- język komunikacji produktowej,
- import/eksport projektu `.fotobeat.json`.

## Co nie jest wspólne

Nie współdzielimy bezpośrednio:

- runtime,
- backendu,
- auth,
- storage,
- render queue,
- sposobu dostępu do plików,
- release/deploy,
- dependency graph.

## FotoBeat Desktop

Desktop jest dla użytkownika, który chce pracować lokalnie:

```text
lokalne pliki
→ lokalny project engine
→ timeline
→ lokalny render job
→ pliki na dysku
→ MP4
```

Priorytety:

- offline-first/local-first,
- szybki import dużych paczek zdjęć,
- zapis jobów i manifestów na dysku,
- lokalny FFmpeg,
- instalator Windows,
- brak wymogu logowania.

## FotoBeat Web/SaaS

SaaS jest dla użytkownika, który chce pracować przez przeglądarkę i projekty w chmurze:

```text
konto użytkownika
→ upload do storage
→ backend API
→ render queue
→ worker
→ MP4 w chmurze
```

Priorytety:

- auth,
- projekty użytkownika,
- storage,
- backend queue,
- worker rendering,
- billing/limity,
- deploy i CI/CD.

## Kontrakty między produktami

Źródłem prawdy dla wspólnych danych jest `docs/CONTRACTS.md` oraz pliki w `contracts/`:

```text
fotobeat.project.v1
fotobeat.render.v1
fotobeat.preset.v1
```

Kontrakty są walidowane przez `npm run contracts:check`. Zmiana łamiąca zgodność wymaga nowej wersji schematu, a nie cichej zmiany `v1`.

Później kontrakty mogą zostać wydzielone do osobnego repo `fotobeat-contracts`, ale dopóki Desktop prowadzi render E2E, trzymamy je tutaj jako źródło prawdy i synchronizujemy SaaS osobnymi PR-ami.

## Zasada rozwoju

Każde repo musi być w stanie działać niezależnie.

- Desktop nie może wymagać backendu SaaS.
- SaaS nie może wymagać Electron/Desktop.
- Integracja między nimi ma być przez eksport/import projektu lub wspólny manifest, nie przez współdzielenie runtime.
