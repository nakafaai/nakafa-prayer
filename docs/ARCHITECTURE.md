# Architecture

Nakafa Prayer is a native Swift macOS app built around standard menu bar,
Settings, notification, location, login-item, and AppKit window APIs.

## Modules

- `NakafaPrayerCore` owns stable IDs, schema-versioned settings, localization,
  prayer calculation, date formatting, and rolling schedule planning.
- `NakafaPrayerApp` owns local notifications, Core Location, local location
  cache, the native menu and Settings scenes, Focus Mode, and login items.
- `NakafaPrayer` is the direct-download executable with optional Sparkle updates.
- `NakafaPrayerAppStore` excludes Sparkle and application network capability.
- `scripts` owns bundling, signing validation, audio preparation, and release
  boundary checks.

## Reminder Flow

`PrayerSchedulePlanner` calculates up to 35 future occurrences across seven
local calendar days. Each ID contains its local date and prayer ID. The
notification scheduler reconciles only IDs with the
`ai.nakafa.prayer.v1.` prefix, adds desired requests first, then removes stale
owned requests.

Reconciliation runs after committed calculation or location changes, startup,
wake, clock changes, timezone changes, and local day changes. Manual coordinate
text fields are view-local drafts. Only Apply persists and reschedules them.

## Location Boundary

`PrayerSettings` stores the selected location mode, optional manual coordinates,
and an optional user-entered label. `LocationCache` separately stores the last
automatic coordinates and capture time. `LocationService` requests a one-shot
Core Location update and never geocodes or creates a network request.

## Focus Mode

Focus Mode is an explicit preference with versioned consent. A single timer
updates the current menu occurrence and may start Focus Mode only when the event
is no more than five minutes late. Full-screen windows use auto-hidden system UI,
preserve app switching, track connected displays, and provide Button, Escape,
confirmation, and accessibility release paths.

## Distribution

The direct build uses `NakafaPrayerDirect.entitlements`, including network access
for Sparkle. The App Store build uses `NakafaPrayerAppStore.entitlements`, which
omits network-client access. Both package the same local adhan alert in the main
app Resources directory for notification delivery.
