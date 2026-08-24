# Security and privacy

Nakafa Prayer has no backend, login, sync, analytics, advertising, or remote
command surface.

## Local data

- Prayer settings use macOS preferences.
- Cached automatic coordinates and timestamps stay in local preferences.
- Manual location labels are entered by the user and stay local.
- Prayer calculations and seven-day planning run in process.
- Notification requests are local and owned by a namespaced identifier prefix.
- Audio preview and notification sound use the same bundled CAF resource.

## Permission boundaries

- Notification authorization is requested only from explicit setup actions.
- Location authorization is requested only after an automatic-location action.
- An already-authorized location can receive a one-shot launch or wake refresh.
- Denied, restricted, disabled-sound, and scheduling failures are visible in UI.
- Launch-at-login approval and errors are visible, with the supported Login Items
  Settings action when approval is required.

## Network boundaries

No shared app or App Store source uses `URLSession`, `NSURLConnection`, WebKit,
Network framework connections, reverse geocoding, remote audio, or telemetry.
The App Store entitlement omits network-client access. A release script checks
both source API use and linked network-capable frameworks.

The direct executable embeds Sparkle and retains network-client access only for
signed update checks. Prayer calculation and reminder delivery do not depend on
that connection.

## Release checks

Public direct downloads must be code signed, notarized, and distributed with a
signed Sparkle appcast. CI validates both entitlement sets, bundle signatures,
resource presence, alert duration below 30 seconds, updater separation,
localization completeness, formatting, tests, and both executable products.
