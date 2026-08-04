# FotoBeat release process

## Versioning

FotoBeat keeps the root package and desktop package on the same `v0.x.x` release line.

```bash
npm run release:version -- 0.1.1 --write
npm run release:check
```

Commit the version change, then tag the exact release commit:

```bash
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

## Windows installer signing

The Windows installer workflow supports signed and unsigned builds.

To sign installers, configure these GitHub Actions repository secrets:

- `WINDOWS_CSC_LINK`: certificate file URL or base64-encoded certificate accepted by electron-builder.
- `WINDOWS_CSC_KEY_PASSWORD`: certificate password.

When both secrets exist, `.github/workflows/windows-installer.yml` exports `CSC_LINK` and `CSC_KEY_PASSWORD` for electron-builder. When either secret is missing, the workflow sets `CSC_IDENTITY_AUTO_DISCOVERY=false` and builds an unsigned installer.

## GitHub Releases

Pushing a `v*` tag runs the Windows Installer workflow. The workflow uploads the NSIS `.exe`, `.yml`, and `.blockmap` files as Actions artifacts and publishes the same files to the matching GitHub Release.

The release guard is:

```bash
npm run release:check
```

## Update path

FotoBeat Desktop does not auto-install updates yet. The supported update path is manual:

1. Open the `Aktualizacje` action in the Desktop render panel.
2. Download the latest installer from GitHub Releases.
3. Run the installer over the existing app.

This keeps update delivery explicit until an auto-update channel is introduced.
