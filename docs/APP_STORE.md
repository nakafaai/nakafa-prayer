# Mac App Store notes

Nakafa Prayer keeps App Store distribution as a separate executable and release
channel.

Build and verify it with:

```bash
RELEASE_CHANNEL=appstore ./scripts/build-app.sh
./scripts/verify-app-bundle.sh appstore
./scripts/audit-appstore-network.sh
```

Before submission, verify:

- `Sparkle.framework` and every Sparkle Info.plist key are absent.
- `com.apple.security.network.client` is absent.
- The local adhan alert exists in `Contents/Resources` and is below 30 seconds.
- Notification and location prompts occur only after related user actions.
- Coordinates are neither geocoded nor transmitted by the app.
- Focus Mode defaults off, keeps application switching available, tracks display
  changes, and releases through Button, confirmation, Escape, or timeout.
- VoiceOver, keyboard navigation, larger text, Reduce Motion, and high contrast
  have been manually checked.
- Notification denial, sound-disabled state, location denial, and Login Items
  approval all provide actionable UI.

The App Store build relies on Mac App Store updates. Do not add Sparkle or a
third-party updater to this channel.
