# Nakafa Prayer

Nakafa Prayer is an open source macOS menu bar app that helps you pray on time.
It calculates prayer times locally from your location, plays a reminder, and can
cover the screen for a short, recoverable focus window.

## Status

Early macOS prototype. The app is built for local use first, then signed and
notarized direct downloads through GitHub Releases.

## Download

Public builds are published on
[GitHub Releases](https://github.com/nakafaai/nakafa-prayer/releases).

Direct latest download:
[NakafaPrayer.dmg](https://github.com/nakafaai/nakafa-prayer/releases/latest/download/NakafaPrayer.dmg)

For a normal install:

1. Download the latest `NakafaPrayer.dmg`.
2. Open the DMG.
3. Drag `Nakafa Prayer.app` to Applications.
4. Open the app and allow location permission.

Signed downloads require Apple Developer credentials in the release workflow.
Unsigned local builds are only for development.

## Features

- Offline prayer time calculation with `adhan-swift`
- Current-location or manual-coordinate mode
- Five wajib prayer reminders
- Adhan audio hook plus localized spoken reminder
- Strict recoverable fullscreen lock
- English and Indonesian UI, ready for future locales
- Launch-at-login support
- Local-only settings and location data

## Requirements

- macOS 14+
- Xcode 26 or newer, or Swift 6 toolchain
- Apple Developer Program membership for signed releases

## Development

```bash
git clone https://github.com/nakafaai/nakafa-prayer.git
cd nakafa-prayer
swift test
swift build
```

Format Swift files:

```bash
swift format format --in-place --recursive Sources Tests
```

Build a local `.app` bundle:

```bash
./scripts/build-app.sh
open .build/NakafaPrayer.app
```

Install the local app on this Mac:

```bash
./scripts/install-local.sh
```

Editor setup:

- Zed works for editing, language server diagnostics, formatting, and project tasks.
- Xcode is still useful for signing, notarization, App Store work, Instruments,
  and deeper macOS debugging.

See `docs/EDITOR.md` for the verified local setup.

## Release

Direct releases use a signed and notarized DMG. Set the signing and notarization
environment variables documented in `docs/RELEASE.md`, then run:

```bash
./scripts/build-app.sh
./scripts/create-dmg.sh
./scripts/notarize.sh .build/NakafaPrayer.dmg
```

## Privacy

Location is only used on-device to calculate prayer times. See `PRIVACY.md`.

## License

Apache-2.0. See `LICENSE`.
