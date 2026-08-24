#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/.build/NakafaPrayer.app"
CONTENTS="$APP/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"
FRAMEWORKS="$CONTENTS/Frameworks"
INFO_PLIST="$ROOT/BuildSupport/Info.plist"
ENTITLEMENTS="$ROOT/BuildSupport/NakafaPrayerDirect.entitlements"
APP_ICON="$ROOT/BuildSupport/AppIcon.icns"
RELEASE_CHANNEL="${RELEASE_CHANNEL:-direct}"
PRODUCT="NakafaPrayer"
SPARKLE_FEED_URL="${SPARKLE_FEED_URL:-https://github.com/nakafaai/nakafa-prayer/releases/latest/download/appcast.xml}"

case "$RELEASE_CHANNEL" in
  direct)
    PRODUCT="NakafaPrayer"
    ;;
  appstore)
    PRODUCT="NakafaPrayerAppStore"
    ENTITLEMENTS="$ROOT/BuildSupport/NakafaPrayerAppStore.entitlements"
    ;;
  *)
    echo "RELEASE_CHANNEL must be direct or appstore." >&2
    exit 1
    ;;
esac

cd "$ROOT"
swift build -c release --product "$PRODUCT"
BIN_PATH="$(swift build -c release --show-bin-path)"

rm -rf "$APP"
mkdir -p "$MACOS" "$RESOURCES" "$FRAMEWORKS"

cp "$BIN_PATH/$PRODUCT" "$MACOS/NakafaPrayer"
cp "$INFO_PLIST" "$CONTENTS/Info.plist"
cp "$APP_ICON" "$RESOURCES/AppIcon.icns"

CORE_RESOURCES="$BIN_PATH/nakafa-prayer_NakafaPrayerCore.bundle"
if [[ -d "$CORE_RESOURCES" ]]; then
  cp -R "$CORE_RESOURCES" "$RESOURCES/"
fi

ADHAN_ALERT="$BIN_PATH/nakafa-prayer_NakafaPrayerApp.bundle/adhan-alert.caf"
ADHAN_ATTRIBUTION="$BIN_PATH/nakafa-prayer_NakafaPrayerApp.bundle/ATTRIBUTION.md"
ADHAN_LICENSE="$ROOT/.build/checkouts/adhan-swift/LICENSE"
if [[ ! -f "$ADHAN_ALERT" ]]; then
  echo "Bundled adhan alert was not found in SwiftPM build artifacts." >&2
  exit 1
fi
if [[ ! -f "$ADHAN_ATTRIBUTION" ]]; then
  echo "Adhan alert attribution was not found in SwiftPM build artifacts." >&2
  exit 1
fi
if [[ ! -f "$ADHAN_LICENSE" ]]; then
  echo "Adhan dependency license was not found in SwiftPM checkouts." >&2
  exit 1
fi
cp "$ADHAN_ALERT" "$RESOURCES/adhan-alert.caf"
cp "$ADHAN_ATTRIBUTION" "$RESOURCES/AdhanAudio-ATTRIBUTION.md"
cp "$ADHAN_LICENSE" "$RESOURCES/Adhan-LICENSE.txt"

set_plist_string() {
  local key="$1"
  local value="$2"

  /usr/libexec/PlistBuddy -c "Set :$key $value" "$CONTENTS/Info.plist" 2>/dev/null \
    || /usr/libexec/PlistBuddy -c "Add :$key string $value" "$CONTENTS/Info.plist"
}

set_plist_bool() {
  local key="$1"
  local value="$2"

  /usr/libexec/PlistBuddy -c "Set :$key $value" "$CONTENTS/Info.plist" 2>/dev/null \
    || /usr/libexec/PlistBuddy -c "Add :$key bool $value" "$CONTENTS/Info.plist"
}

delete_plist_key() {
  local key="$1"

  /usr/libexec/PlistBuddy -c "Delete :$key" "$CONTENTS/Info.plist" 2>/dev/null || true
}

copy_sparkle_framework() {
  local framework
  framework="$(find "$ROOT/.build" -path "*/Sparkle.framework" -type d | head -1)"

  if [[ -z "$framework" ]]; then
    echo "Sparkle.framework was not found in SwiftPM build artifacts." >&2
    exit 1
  fi

  ditto "$framework" "$FRAMEWORKS/Sparkle.framework"
}

sign_app() {
  local item="$1"

  if [[ -n "${DEVELOPER_ID_APPLICATION:-}" ]]; then
    codesign --force --options runtime --timestamp \
      --entitlements "$ENTITLEMENTS" \
      --sign "$DEVELOPER_ID_APPLICATION" \
      "$item"
  else
    codesign --force --sign - \
      --entitlements "$ENTITLEMENTS" \
      "$item"
  fi
}

sign_embedded_item() {
  local item="$1"

  if [[ -n "${DEVELOPER_ID_APPLICATION:-}" ]]; then
    codesign --force --options runtime --timestamp \
      --preserve-metadata=entitlements \
      --sign "$DEVELOPER_ID_APPLICATION" \
      "$item"
  else
    codesign --force --sign - \
      --preserve-metadata=entitlements \
      "$item"
  fi
}

APP_VERSION="${APP_VERSION:-}"
if [[ -z "$APP_VERSION" && "${GITHUB_REF_NAME:-}" == v* ]]; then
  APP_VERSION="${GITHUB_REF_NAME#v}"
fi
if [[ "$APP_VERSION" == v* ]]; then
  APP_VERSION="${APP_VERSION#v}"
fi

if [[ -n "$APP_VERSION" ]]; then
  set_plist_string "CFBundleShortVersionString" "$APP_VERSION"
fi

if [[ -n "${APP_BUILD:-${GITHUB_RUN_NUMBER:-}}" ]]; then
  set_plist_string "CFBundleVersion" "${APP_BUILD:-${GITHUB_RUN_NUMBER}}"
fi

if [[ "$RELEASE_CHANNEL" == "direct" ]]; then
  if [[ -n "${DEVELOPER_ID_APPLICATION:-}" && -z "${SPARKLE_PUBLIC_ED_KEY:-}" ]]; then
    echo "SPARKLE_PUBLIC_ED_KEY is required for signed direct releases." >&2
    exit 1
  fi

  copy_sparkle_framework
  SPARKLE_LICENSE="$ROOT/.build/checkouts/sparkle/LICENSE"
  if [[ ! -f "$SPARKLE_LICENSE" ]]; then
    echo "Sparkle dependency license was not found in SwiftPM checkouts." >&2
    exit 1
  fi
  cp "$SPARKLE_LICENSE" "$RESOURCES/Sparkle-LICENSE.txt"
  install_name_tool -add_rpath "@executable_path/../Frameworks" "$MACOS/NakafaPrayer" \
    2>/dev/null || true

  if [[ -n "${SPARKLE_PUBLIC_ED_KEY:-}" ]]; then
    set_plist_string "SUFeedURL" "$SPARKLE_FEED_URL"
    set_plist_string "SUPublicEDKey" "$SPARKLE_PUBLIC_ED_KEY"
    set_plist_bool "SURequireSignedFeed" "true"
    set_plist_bool "SUVerifyUpdateBeforeExtraction" "true"
  fi
else
  delete_plist_key "SUFeedURL"
  delete_plist_key "SUPublicEDKey"
  delete_plist_key "SURequireSignedFeed"
  delete_plist_key "SUVerifyUpdateBeforeExtraction"
fi

if [[ -d "$FRAMEWORKS/Sparkle.framework" ]]; then
  while IFS= read -r item; do
    sign_embedded_item "$item"
  done < <(
    find "$FRAMEWORKS/Sparkle.framework" \
      \( -name "*.xpc" -o -name "*.app" -o -name "Autoupdate" -o -name "Installer" \) \
      -print
  )

  sign_embedded_item "$FRAMEWORKS/Sparkle.framework"
fi

sign_app "$APP"

echo "$APP"
