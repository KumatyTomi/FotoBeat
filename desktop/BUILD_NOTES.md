# Desktop build notes

Dev: run `npm run dev:win` in `desktop` while root Vite dev server is running.

Windows installer: the GitHub Actions workflow `.github/workflows/windows-installer.yml` builds the NSIS installer and uploads `desktop/release` artifacts.

Manual Windows build: install root dependencies, build the web app, install `desktop` dependencies, then run the desktop `dist` script. Output directory: `desktop/release`.
