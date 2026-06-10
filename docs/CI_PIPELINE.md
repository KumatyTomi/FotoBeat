# FotoBeat CI pipeline

## Current jobs

The repository CI now has two jobs:

```text
web-check
desktop-package-smoke
```

## web-check

Runs on every push and pull request to `main`.

Steps:

```bash
npm install
npm run lint:strict
npm run build
```

This catches strict ESLint failures and Vite build failures before changes land.

## desktop-package-smoke

Runs after `web-check`.

Steps:

```bash
npm install
cd desktop
npm install
npm run pack
```

`desktop/package.json` runs `npm run build:web` before `electron-builder --dir`, so this job validates the web build and Electron directory packaging path together.

## Why npm install, not npm ci yet

The repository does not currently have committed lockfiles.

Until these files exist, CI must use `npm install`:

```text
package-lock.json
desktop/package-lock.json
```

After both lockfiles are generated and committed, replace install steps with:

```bash
npm ci
```

and, for desktop:

```bash
cd desktop
npm ci
```

Then enable npm cache in `actions/setup-node`.

## Recommended next CI improvements

1. Commit root and desktop lockfiles.
2. Switch CI from `npm install` to `npm ci`.
3. Add artifact upload for desktop package smoke logs.
4. Add Windows package job later after installer signing strategy is decided.
5. Add Electron security checks after preload API hardening.
