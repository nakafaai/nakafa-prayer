#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DMG="${1:-$ROOT/.build/NakafaPrayer.dmg}"
APPCAST_DIR="$ROOT/.build/appcast"
APPCAST="$APPCAST_DIR/appcast.xml"
OUTPUT="$ROOT/.build/appcast.xml"
DOWNLOAD_URL_PREFIX="${SPARKLE_DOWNLOAD_URL_PREFIX:-https://github.com/nakafaai/nakafa-prayer/releases/latest/download/}"

if [[ ! -f "$DMG" ]]; then
  echo "Missing $DMG. Run ./scripts/create-dmg.sh first." >&2
  exit 1
fi

if [[ -z "${SPARKLE_PRIVATE_ED_KEY:-}" ]]; then
  echo "SPARKLE_PRIVATE_ED_KEY is required to sign appcast updates." >&2
  exit 1
fi

TOOL="$(find "$ROOT/.build" -path "*/bin/generate_appcast" -type f | head -1)"
if [[ -z "$TOOL" ]]; then
  echo "Sparkle generate_appcast was not found. Run swift package resolve first." >&2
  exit 1
fi

rm -rf "$APPCAST_DIR"
mkdir -p "$APPCAST_DIR"
cp "$DMG" "$APPCAST_DIR/NakafaPrayer.dmg"

printf "%s" "$SPARKLE_PRIVATE_ED_KEY" \
  | "$TOOL" \
    --ed-key-file - \
    --download-url-prefix "$DOWNLOAD_URL_PREFIX" \
    "$APPCAST_DIR"

cp "$APPCAST" "$OUTPUT"
echo "$OUTPUT"
