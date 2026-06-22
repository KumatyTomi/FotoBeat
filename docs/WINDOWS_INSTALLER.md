# FotoBeat.me Desktop — Windows installer

## Status

Windows installer is built by GitHub Actions workflow:

- `.github/workflows/windows-installer.yml`
- runner: `windows-latest`
- output artifact: `FotoBeat-Windows-Installer`

## Build path

1. Install web dependencies with `npm ci`.
2. Build Vite app with `npm run build`.
3. Install desktop dependencies in `desktop/` with `npm ci`.
4. Run `npm run dist` in `desktop/`.
5. Upload `desktop/release/*.exe` and update metadata as workflow artifacts.

## Manual local build

```bash
npm ci
npm run build
cd desktop
npm ci
npm run dist
```

The generated Windows installer lands in `desktop/release/`.
