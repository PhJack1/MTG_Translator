#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
TARGETS=("firefox" "chrome")

# ─── Build + Zip ──────────────────────────────────────────────────────────────
for target in "${TARGETS[@]}"; do
  echo "▶ Building $target..."
  
  rm -rf "dist/$target"
  mkdir -p "dist/$target"
  
  cp -r src/. "dist/$target/"
  cp "manifests/manifest.$target.json" "dist/$target/manifest.json"
  
  echo "  ✓ dist/$target/ prêt"

  echo "  ▶ Création de l'archive zip..."
  (
    cd "dist/$target"
    zip -r "../mtg-translator-$target.zip" . > /dev/null
  )
  echo "  ✓ mtg-translator-$target.zip créé"
done

echo ""
echo "✅ Build + zip terminés !"
echo "   dist/firefox/  → Firefox Add-ons (AMO)"
echo "   dist/chrome/   → Chrome Web Store / Brave"
echo ""
echo "📦 Archives générées :"
echo "   dist/mtg-translator-firefox.zip"
echo "   dist/mtg-translator-chrome.zip"