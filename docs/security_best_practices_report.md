# Security best-practices report

## Current controls

- Native macOS sandboxing is enabled for both channels.
- Direct and App Store builds use separate entitlement files.
- The App Store build omits network-client access and excludes Sparkle.
- Shared app source has no reverse geocoder, remote audio, URL loading, WebKit,
  Network framework connection, telemetry, or backend client.
- Coordinates, labels, preferences, and cached timestamps stay local.
- Notification and location prompts require explicit user actions.
- Notification requests use a versioned app-owned prefix and never remove other
  apps' requests.
- Focus Mode is disabled after legacy migration until current consent is given.
- Focus Mode preserves application switching and provides redundant release
  controls.
- Corrupt settings recovery, scheduling errors, location failures, notification
  states, and launch-at-login errors are visible.
- The bundled alert has CC0 provenance, source and derived hashes, a reproducible
  edit script, and a release duration check.
- GitHub Actions are pinned to immutable commits.

## Automated evidence

The required local and CI checks are:

```bash
swift test
swift build
swift build --product NakafaPrayerAppStore
swift scripts/check-localization.swift
swift format lint --recursive --strict Sources Tests scripts/prepare-adhan-audio.swift

./scripts/build-app.sh
./scripts/verify-app-bundle.sh direct

RELEASE_CHANNEL=appstore ./scripts/build-app.sh
./scripts/verify-app-bundle.sh appstore
./scripts/audit-appstore-network.sh
```

## Manual release gates

- Verify notification delivery after sleep, quit, permission denial, permission
  revocation, timezone changes, clock changes, and midnight.
- Verify Focus Mode with VoiceOver, keyboard-only navigation, Escape,
  accessibility text sizes, Reduce Motion, high contrast, multiple displays,
  Spaces, display attach and detach, timeout, and quit.
- Verify both English and Indonesian under 12-hour and 24-hour system formats.
- Capture an interaction Instruments trace and confirm no hangs or hitches, plus
  no scheduling work while typing manual coordinates.
- Inspect the final App Store archive entitlements and linked frameworks.

These manual checks remain release gates until they are performed against the
exact candidate build.
