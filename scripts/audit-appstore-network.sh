#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/.build/NakafaPrayer.app"
BINARY="$APP/Contents/MacOS/NakafaPrayer"

if rg -n \
  'AVPlayer|CLGeocoder|NSURLConnection|URLSession|WKWebView|NWConnection' \
  "$ROOT/Sources/NakafaPrayerApp" \
  "$ROOT/Sources/NakafaPrayerAppStore" \
  "$ROOT/Sources/NakafaPrayerCore"; then
  echo "An application-controlled network API was found in App Store sources." >&2
  exit 1
fi

if otool -L "$BINARY" | rg 'Sparkle|CFNetwork|WebKit|Network\.framework'; then
  echo "An unexpected network-capable framework is linked by the App Store binary." >&2
  exit 1
fi

if codesign -d --entitlements - --xml "$APP" 2>/dev/null \
  | rg 'com\.apple\.security\.network\.client'; then
  echo "The App Store build has the network-client entitlement." >&2
  exit 1
fi

echo "App Store network boundary OK"
