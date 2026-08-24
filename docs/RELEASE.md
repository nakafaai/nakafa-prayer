# Release

Direct downloads are published through GitHub Releases as a DMG.
Installed direct-download builds update through Sparkle.

Stable public download URL after the first release:

```text
https://github.com/nakafaai/nakafa-prayer/releases/latest/download/NakafaPrayer.dmg
https://github.com/nakafaai/nakafa-prayer/releases/latest/download/appcast.xml
```

## Required Secrets

Set these repository secrets before tagging a release:

- `DEVELOPER_ID_APPLICATION`
- `APPLE_CERTIFICATE_P12_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `KEYCHAIN_PASSWORD`
- `APPLE_ID`
- `APPLE_TEAM_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `SPARKLE_PUBLIC_ED_KEY`
- `SPARKLE_PRIVATE_ED_KEY`

`DEVELOPER_ID_APPLICATION` must match the Common Name of the imported
Developer ID Application certificate, for example
`Developer ID Application: PT. Nakafa Tekno Kreatif (TEAMID)`.

Run the `Release` workflow manually before creating a tag. Manual runs validate
that every required secret is available and never build or publish a release.

To create the base64 certificate secret from an exported `.p12` file:

```bash
base64 -i developer-id-application.p12 | pbcopy
```

Create the Sparkle EdDSA update key once with Sparkle's tool:

```bash
swift package resolve
.build/artifacts/sparkle/Sparkle/bin/generate_keys --account nakafa-prayer
PRIVATE_KEY_FILE="$(mktemp -t nakafa-prayer-sparkle-key.XXXXXX)"
rm -f "$PRIVATE_KEY_FILE"
.build/artifacts/sparkle/Sparkle/bin/generate_keys --account nakafa-prayer -x "$PRIVATE_KEY_FILE"
pbcopy < "$PRIVATE_KEY_FILE"
rm -f "$PRIVATE_KEY_FILE"
```

Put the printed public key in `SPARKLE_PUBLIC_ED_KEY`. Put the private key that
was copied to the clipboard in `SPARKLE_PRIVATE_ED_KEY`. Do not commit the
private key.

## Publish

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow builds the direct channel, embeds Sparkle, creates
`NakafaPrayer.dmg`, submits it to Apple notarization, staples the notarization
ticket, signs `appcast.xml`, and uploads the DMG plus appcast to the GitHub
Release.

## Local Unsigned Build

For local testing only:

```bash
./scripts/build-app.sh
./scripts/create-dmg.sh
./scripts/install-local.sh
```

Unsigned local builds are not suitable for public downloads.
Local direct builds hide the update menu unless `SPARKLE_PUBLIC_ED_KEY` is set.

## Release Channels

Direct channel:

```bash
SPARKLE_PUBLIC_ED_KEY="<public key>" ./scripts/build-app.sh
./scripts/create-dmg.sh
./scripts/notarize.sh .build/NakafaPrayer.dmg
SPARKLE_PRIVATE_ED_KEY="<private key>" ./scripts/generate-appcast.sh .build/NakafaPrayer.dmg
```

App Store channel:

```bash
RELEASE_CHANNEL=appstore ./scripts/build-app.sh
```

The App Store channel must not contain `Sparkle.framework`, `SUFeedURL`,
`SUPublicEDKey`, `SURequireSignedFeed`, or `SUVerifyUpdateBeforeExtraction`.
App Store updates are distributed by the Mac App Store.

## Install UX

A browser link can start a one-click DMG download. macOS does not allow a
website to silently install and run a downloaded app, and that is a useful
security boundary. The v1 public path is a signed and notarized DMG. Future
options for less friction are a signed `.pkg`, a Homebrew cask, or Mac App
Store distribution after the App Store candidate passes Focus Mode review.
