# Architecture

Nakafa Prayer v1 is a native Swift macOS app.

## Why Native Swift

Expo is a strong fit for Android, iOS, and web apps. The Expo docs describe a
JavaScript/TypeScript app model, native builds for iOS and Android, and Expo
Modules for adding Swift/Kotlin native APIs. Expo Modules currently list macOS
as experimental additional platform support.

This app's primary product surface is macOS-specific:

- menu bar lifecycle
- Core Location permission copy
- `SMAppService` launch-at-login registration
- AppKit fullscreen windows across all displays
- app switching and menu bar presentation options
- Developer ID signing, notarization, and DMG distribution

Keeping v1 in Swift avoids adding a JavaScript runtime and native-module layer
around APIs that already need direct AppKit and ServiceManagement control.

## Module Shape

- `NakafaPrayerCore` owns settings, localization, time formatting, prayer IDs,
  prayer calculation, and next-prayer scheduling.
- `NakafaPrayer` owns macOS services: location, menu bar, settings window,
  reminder audio, launch-at-login sync, and the lock overlay.
- Shell scripts own local app bundling, local installation, DMG creation, and
  notarization.

## Distribution

The first public distribution target is a signed and notarized GitHub Release
DMG. The stable direct-download URL is:

```text
https://github.com/nakafaai/nakafa-prayer/releases/latest/download/NakafaPrayer.dmg
```

App Store distribution can be added later, but it may require a softer lock mode
or a separate configuration if review rejects the strict focus behavior.
