# FotoBeat contracts v1

Ten dokument zamraza minimalne kontrakty danych, ktore maja byc wspolne dla FotoBeat Desktop i FotoBeat Web/SaaS. Kontrakty nie oznaczaja wspolnego runtime. Sa tylko wspolnym jezykiem importu, eksportu, presetow i render jobow.

## Zrodlo prawdy

```txt
contracts/
  fotobeat.project.v1.schema.json
  fotobeat.render.v1.schema.json
  fotobeat.preset.v1.schema.json
  examples/
    project.valid.json
    render.valid.json
    preset.valid.json
```

Kazda zmiana kontraktu musi przejsc `npm run contracts:check`. Jesli zmiana lamie zgodnosc, nalezy dodac nowa wersje schematu zamiast cicho zmieniac `v1`.

## Zasady kompatybilnosci

- `schemaVersion` jest obowiazkowe i ma wartosc stala dla danego kontraktu.
- Pola wymagane w v1 nie moga zmienic znaczenia.
- Nowe pola moga byc dodawane jako opcjonalne.
- Desktop nie moze wymagac backendu SaaS.
- SaaS nie moze wymagac Electron/Desktop.
- Integracja odbywa sie przez `.fotobeat.json`, manifest renderu albo preset, nie przez wspoldzielenie kodu runtime.

## `fotobeat.project.v1`

Kontrakt projektu opisuje decyzje montazowe, ustawienia i referencje do mediow. Nie zawiera binarnych danych zdjec ani audio.

Minimalny zakres:

- metadane projektu,
- ustawienia formatu i presetu,
- lista assetow z fingerprintami,
- timeline z clipami,
- opcjonalne snapshoty.

## `fotobeat.render.v1`

Kontrakt renderu jest payloadem dla renderera Desktop albo workera SaaS. Zawiera tylko to, co renderer musi wiedziec, aby wygenerowac MP4.

Minimalny zakres:

- projekt i preset,
- output profile: ratio, width, height, fps, duration,
- assety uzyte w renderze,
- audio,
- timeline,
- ustawienia renderu.

## `fotobeat.preset.v1`

Kontrakt presetu opisuje styl, parametry efektow i domyslne przejscia. Preset powinien byc przenoszalny miedzy Desktop i SaaS.

Minimalny zakres:

- identyfikator i nazwa,
- rodzina stylu,
- tempo efektow,
- przejscia,
- parametry wizualne,
- wsparcie formatow.

## Definition of Done dla zmian kontraktu

- schema istnieje w `contracts/`,
- przyklad valid istnieje w `contracts/examples/`,
- `npm run contracts:check` przechodzi,
- dokumentacja opisuje wplyw na Desktop i SaaS,
- jesli kontrakt dotyka backendu, repo `FotoBeat---saas` dostaje osobny PR synchronizujacy walidacje.
