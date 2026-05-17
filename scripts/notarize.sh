#!/usr/bin/env bash
set -euo pipefail

ARTIFACT="${1:-}"

if [[ -z "$ARTIFACT" || ! -e "$ARTIFACT" ]]; then
  echo "Usage: ./scripts/notarize.sh path/to/NakafaPrayer.dmg" >&2
  exit 1
fi

for name in APPLE_ID APPLE_TEAM_ID APPLE_APP_SPECIFIC_PASSWORD; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing $name." >&2
    exit 1
  fi
done

xcrun notarytool submit "$ARTIFACT" \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" \
  --wait

xcrun stapler staple "$ARTIFACT"
