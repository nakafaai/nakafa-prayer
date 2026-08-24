# Nakafa Prayer

Nakafa Prayer is a native macOS menu bar app for locally calculated prayer
times and reliable local reminders.

## Status

The app is in beta. Public direct downloads must be Developer ID signed and
notarized before broad distribution.

## Features

- Seven local calendar days of prayer notifications scheduled through macOS
- Offline prayer calculation with `adhan-swift`
- Automatic Core Location or explicitly applied manual coordinates
- One bundled, local adhan alert with Settings preview
- Optional, reversible Focus Mode across connected displays
- English and Indonesian interfaces
- User-controlled launch at login
- Local settings and cached coordinates with no Nakafa account or analytics

Notifications are the default reminder channel. Focus Mode is opt-in, runs only
while the app is running, does not block application switching, and never starts
more than five minutes after a delayed prayer event.

## Download

Public builds are published on
[GitHub Releases](https://github.com/nakafaai/nakafa-prayer/releases).

Direct latest download:
[NakafaPrayer.dmg](https://github.com/nakafaai/nakafa-prayer/releases/latest/download/NakafaPrayer.dmg)

For a normal install:

1. Download and open `NakafaPrayer.dmg`.
2. Drag `Nakafa Prayer.app` to Applications.
3. Open the app.
4. In Settings, enable notifications and choose a location source.

The app requests notification and location permission only after the related
user action.

## Privacy

Prayer calculation, coordinates, location labels, preferences, and reminder
planning stay local. The app does not reverse geocode coordinates and does not
stream audio. Direct builds retain network access only for Sparkle update checks.
The App Store build has no network-client entitlement or application-controlled
network path. See [PRIVACY.md](PRIVACY.md).

## Development

Requirements:

- macOS 14 or newer
- Xcode 26 or newer, or a compatible Swift 6 toolchain

Build and test:

```bash
swift test
swift build
swift build --product NakafaPrayerAppStore
swift scripts/check-localization.swift
swift format lint --recursive --strict Sources Tests scripts/prepare-adhan-audio.swift
```

Build native app bundles:

```bash
./scripts/build-app.sh
./scripts/verify-app-bundle.sh direct

RELEASE_CHANNEL=appstore ./scripts/build-app.sh
./scripts/verify-app-bundle.sh appstore
./scripts/audit-appstore-network.sh
```

Format Swift files:

```bash
swift format format --in-place --recursive Sources Tests scripts/prepare-adhan-audio.swift
```

The bundled alert provenance and reproducible edit are recorded in
`Sources/NakafaPrayerApp/Resources/AdhanAudio/ATTRIBUTION.md`.

## Distribution

The direct channel embeds Sparkle for signed appcast updates. The App Store
channel excludes Sparkle and relies on Mac App Store updates. See
`docs/RELEASE.md` and `docs/APP_STORE.md`.

## License

Application source is Apache-2.0. See `LICENSE`. Built app bundles also include
the required Adhan and Sparkle dependency notices. The adhan alert is CC0
1.0 and documented separately in its attribution file.
