#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/.build/NakafaPrayer.app"
CONTENTS="$APP/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"
INFO_PLIST="$ROOT/BuildSupport/Info.plist"
ENTITLEMENTS="$ROOT/BuildSupport/NakafaPrayer.entitlements"

cd "$ROOT"
swift build -c release
BIN_PATH="$(swift build -c release --show-bin-path)"

rm -rf "$APP"
mkdir -p "$MACOS" "$RESOURCES"

cp "$BIN_PATH/NakafaPrayer" "$MACOS/NakafaPrayer"
cp "$INFO_PLIST" "$CONTENTS/Info.plist"

find "$BIN_PATH" -maxdepth 1 -name "*.bundle" -exec cp -R {} "$RESOURCES/" \;

if [[ -n "${DEVELOPER_ID_APPLICATION:-}" ]]; then
  codesign --force --options runtime --timestamp \
    --entitlements "$ENTITLEMENTS" \
    --sign "$DEVELOPER_ID_APPLICATION" \
    "$APP"
else
  codesign --force --sign - \
    --entitlements "$ENTITLEMENTS" \
    "$APP"
fi

echo "$APP"
