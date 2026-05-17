#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/.build/NakafaPrayer.app"
DMG="$ROOT/.build/NakafaPrayer.dmg"

if [[ ! -d "$APP" ]]; then
  echo "Missing $APP. Run ./scripts/build-app.sh first." >&2
  exit 1
fi

rm -f "$DMG"
hdiutil create \
  -volname "Nakafa Prayer" \
  -srcfolder "$APP" \
  -ov \
  -format UDZO \
  "$DMG"

echo "$DMG"
