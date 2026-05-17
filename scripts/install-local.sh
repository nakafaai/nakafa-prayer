#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/.build/NakafaPrayer.app"
APP_NAME="Nakafa Prayer.app"
DEST_ROOT="${NAKAFA_PRAYER_INSTALL_DIR:-/Applications}"

"$ROOT/scripts/build-app.sh" >/dev/null

if [[ ! -w "$DEST_ROOT" ]]; then
  DEST_ROOT="$HOME/Applications"
  mkdir -p "$DEST_ROOT"
fi

DEST="$DEST_ROOT/$APP_NAME"

if [[ -e "$DEST" ]]; then
  IDENTIFIER=$(
    /usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$DEST/Contents/Info.plist" \
      2>/dev/null || true
  )

  if [[ "$IDENTIFIER" != "ai.nakafa.prayer" ]]; then
    echo "Refusing to replace an app that is not Nakafa Prayer: $DEST" >&2
    exit 1
  fi

  osascript -e 'tell application id "ai.nakafa.prayer" to quit' >/dev/null 2>&1 || true
  sleep 1
  rm -rf "$DEST"
fi

ditto "$SOURCE" "$DEST"

LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
if [[ -x "$LSREGISTER" ]]; then
  "$LSREGISTER" -f "$DEST" >/dev/null 2>&1 || true
fi

open "$DEST"
echo "$DEST"
