#!/usr/bin/env bash
# Downloads the static TTFs used by the CV PDF (@react-pdf/renderer, phase 3)
# and each family's SIL OFL text into assets/fonts-pdf/ (decision D-19).
#
# Source: the official Google Fonts download manifest of each family
# (https://fonts.google.com/download/list?family=<Family>), the same files the
# "Download family" ZIP ships. Only the static/ instances are taken, never the
# variable font. Idempotent: re-running overwrites the same nine files.
#
# Verify afterwards with:
#   python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/fonts-pdf"
mkdir -p "$OUT"

# family|license file name|static files (space separated)
FAMILIES=(
  "Funnel Display|OFL-FunnelDisplay.txt|FunnelDisplay-SemiBold.ttf FunnelDisplay-Bold.ttf"
  "Hanken Grotesk|OFL-HankenGrotesk.txt|HankenGrotesk-Regular.ttf HankenGrotesk-Bold.ttf HankenGrotesk-Italic.ttf"
  "Geist Mono|OFL-GeistMono.txt|GeistMono-Regular.ttf"
)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for entry in "${FAMILIES[@]}"; do
  IFS='|' read -r family license files <<<"$entry"
  query="${family// /%20}"
  manifest="$TMP/manifest.json"

  echo "Fetching manifest for $family"
  # Google prepends an anti-JSON-hijacking line ()]}') that must be dropped.
  curl -sf "https://fonts.google.com/download/list?family=$query" | tail -n +2 >"$manifest"

  # Write the OFL text straight from the manifest.
  node -e '
    const fs = require("node:fs");
    const [manifestPath, family, target] = process.argv.slice(1);
    const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const ofl = (data.manifest?.files ?? []).find((f) => f.filename === "OFL.txt");
    if (!ofl) {
      console.error(`Missing OFL.txt in the ${family} manifest`);
      process.exit(1);
    }
    fs.writeFileSync(target, ofl.contents);
  ' "$manifest" "$family" "$OUT/$license"
  echo "  wrote $license"

  for file in $files; do
    url="$(node -e '
      const fs = require("node:fs");
      const [manifestPath, family, wanted] = process.argv.slice(1);
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const ref = (data.manifest?.fileRefs ?? []).find((f) => f.filename === wanted);
      if (!ref) {
        console.error(`Missing ${wanted} in the ${family} manifest`);
        process.exit(1);
      }
      process.stdout.write(ref.url);
    ' "$manifest" "$family" "static/$file")"
    curl -sf "$url" -o "$OUT/$file"
    echo "  wrote $file"
  done
done

echo "Done. Now run: python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf"
