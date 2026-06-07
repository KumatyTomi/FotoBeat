#!/usr/bin/env bash
set -euo pipefail

# Uruchom w katalogu rozpakowanej paczki.
# Wymaga Git oraz prawa zapisu do repo KumatyTomi/FotoBeat.

git init
git branch -M main
git add .
git commit -m "Add FotoBeat starter project"
git remote add origin https://github.com/KumatyTomi/FotoBeat.git
git push -u origin main
