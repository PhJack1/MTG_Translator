#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
TARGETS=("firefox" "chrome")

# ─── Build ────────────────────────────────────────────────────────────────────
for target in "${TARGETS[@]}"; do
  echo "▶ Building $target..."
  rm -rf "dist/$target"
  mkdir -p "dist/$target"
  cp -r src/. "dist/$target/"
  cp "manifests/manifest.$target.json" "dist/$target/manifest.json"
  echo "  ✓ dist/$target/ prêt"
done

echo ""
echo "✅ Build terminé !"
echo "   dist/firefox/  → Firefox Add-ons (AMO)"
echo "   dist/chrome/   → Chrome Web Store / Brave"
echo ""
echo "Pour créer les zips de soumission :"
echo "  cd dist/firefox && zip -r ../mtg-translator-firefox.zip . && cd ../.."
echo "  cd dist/chrome  && zip -r ../mtg-translator-chrome.zip  . && cd ../.."
