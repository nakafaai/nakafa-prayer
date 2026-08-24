# Privacy

Nakafa Prayer is local-first.

- Prayer times are calculated on this Mac.
- Coordinates are used only for prayer calculation.
- Nakafa Prayer never sends coordinate values or user-entered location labels.
- The app does not reverse geocode or look up place names.
- The adhan alert is bundled and never streamed.
- Settings and the last automatic location are stored locally.
- Prayer reminders use local macOS notifications.
- There is no account, analytics service, advertising SDK, or Nakafa backend.

Automatic location uses Apple's Core Location permission. The permission prompt
appears only after the user selects automatic location or chooses the related
action. Manual coordinates can be used without location permission.

Direct-download builds may contact the configured GitHub Releases appcast
through Sparkle for update checks. The App Store build excludes Sparkle, has no
network-client entitlement, and has no application-controlled network path.
