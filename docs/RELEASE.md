# Release

Direct downloads are published through GitHub Releases as a DMG.

Stable public download URL after the first release:

```text
https://github.com/nakafaai/nakafa-prayer/releases/latest/download/NakafaPrayer.dmg
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

`DEVELOPER_ID_APPLICATION` must match the Common Name of the imported
Developer ID Application certificate, for example
`Developer ID Application: PT. Nakafa Tekno Kreatif (TEAMID)`.

To create the base64 certificate secret from an exported `.p12` file:

```bash
base64 -i developer-id-application.p12 | pbcopy
```

## Publish

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow builds the app, creates `NakafaPrayer.dmg`, submits it to
Apple notarization, staples the notarization ticket, and uploads the DMG to the
GitHub Release.

## Local Unsigned Build

For local testing only:

```bash
./scripts/build-app.sh
./scripts/create-dmg.sh
./scripts/install-local.sh
```

Unsigned local builds are not suitable for public downloads.

## Install UX

A browser link can start a one-click DMG download. macOS does not allow a
website to silently install and run a downloaded app, and that is a useful
security boundary. The v1 public path is a signed and notarized DMG. Future
options for less friction are a signed `.pkg`, a Homebrew cask, or Mac App
Store distribution if App Review accepts the strict lock behavior.
