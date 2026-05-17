# Nakafa Prayer

Nakafa Prayer is an open source macOS menu bar app that helps you pray on time.
It calculates prayer times locally from your location, plays a reminder, and can
cover the screen for a short, recoverable focus window.

## Status

Early macOS prototype. The app is built for local use first, then signed and
notarized direct downloads through GitHub Releases.

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

Build a local `.app` bundle:

```bash
./scripts/build-app.sh
open .build/NakafaPrayer.app
```

## Release

Direct releases use a signed and notarized DMG. Set the signing and notarization
environment variables documented in `scripts/notarize.sh`, then run:

```bash
./scripts/build-app.sh
./scripts/create-dmg.sh
./scripts/notarize.sh .build/NakafaPrayer.dmg
```

## Privacy

Location is only used on-device to calculate prayer times. See `PRIVACY.md`.

## License

Apache-2.0. See `LICENSE`.
