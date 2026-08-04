# FotoBeat.me Desktop — Windows installer

## Status

Windows installer is built by GitHub Actions workflow:

- `.github/workflows/windows-installer.yml`
- runner: `windows-latest`
- output artifact: `FotoBeat-Windows-Installer`
- tag release: pushing a `v*` tag also creates or updates a GitHub Release with the `.exe`, `.yml` and `.blockmap` assets.

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

## GitHub Release flow

1. Update root and desktop package versions in the same release commit.
2. Push a tag such as `v0.1.0`.
3. The Windows Installer workflow builds the NSIS installer.
4. The workflow uploads the installer as an Actions artifact and publishes the same files to the matching GitHub Release.
