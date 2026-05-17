# Release

Direct downloads are published through GitHub Releases as a DMG.

## Required Secrets

Set these repository secrets before tagging a release:

- `DEVELOPER_ID_APPLICATION`
- `APPLE_ID`
- `APPLE_TEAM_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`

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
open .build/NakafaPrayer.app
```

Unsigned local builds are not suitable for public downloads.
