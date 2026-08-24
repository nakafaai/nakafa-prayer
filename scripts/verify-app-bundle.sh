#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/.build/NakafaPrayer.app"
SOUND="$APP/Contents/Resources/adhan-alert.caf"
ATTRIBUTION="$APP/Contents/Resources/AdhanAudio-ATTRIBUTION.md"
ADHAN_LICENSE="$APP/Contents/Resources/Adhan-LICENSE.txt"
SPARKLE_LICENSE="$APP/Contents/Resources/Sparkle-LICENSE.txt"
EXPECTED_SOUND_SHA256="718ad6ea0f2e98e2f125d77e17a6fc9ba4b403d8fe55836acb2775f5cc979436"
CHANNEL="${1:-}"

if [[ "$CHANNEL" != "direct" && "$CHANNEL" != "appstore" ]]; then
  echo "Usage: verify-app-bundle.sh direct|appstore" >&2
  exit 1
fi

test -x "$APP/Contents/MacOS/NakafaPrayer"
test -f "$APP/Contents/Info.plist"
test -f "$SOUND"
test -f "$ATTRIBUTION"
test -f "$ADHAN_LICENSE"
codesign --verify --strict --verbose=2 "$APP"

ACTUAL_SOUND_SHA256="$(shasum -a 256 "$SOUND" | awk '{ print $1 }')"
if [[ "$ACTUAL_SOUND_SHA256" != "$EXPECTED_SOUND_SHA256" ]]; then
  echo "The bundled adhan alert checksum does not match its attribution." >&2
  exit 1
fi

DURATION="$(afinfo "$SOUND" | awk '/estimated duration/ { print $3; exit }')"
if [[ -z "$DURATION" ]]; then
  echo "Could not read the bundled adhan alert duration." >&2
  exit 1
fi

awk -v duration="$DURATION" 'BEGIN { exit !(duration > 0 && duration < 30) }'

ENTITLEMENTS="$(codesign -d --entitlements - --xml "$APP" 2>/dev/null)"
if ! grep -q "com.apple.security.app-sandbox" <<<"$ENTITLEMENTS"; then
  echo "The app sandbox entitlement is missing." >&2
  exit 1
fi

if ! grep -q "com.apple.security.personal-information.location" <<<"$ENTITLEMENTS"; then
  echo "The location entitlement is missing." >&2
  exit 1
fi

if [[ "$CHANNEL" == "direct" ]]; then
  test -f "$SPARKLE_LICENSE"
  grep -q "com.apple.security.network.client" <<<"$ENTITLEMENTS"
else
  test ! -f "$SPARKLE_LICENSE"
  if grep -q "com.apple.security.network.client" <<<"$ENTITLEMENTS"; then
    echo "The App Store channel must not have network-client entitlement." >&2
    exit 1
  fi
fi

echo "App bundle OK: $CHANNEL, adhan alert ${DURATION}s"
