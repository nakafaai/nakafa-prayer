# Nakafa Prayer threat model

## Scope

This model covers the macOS app, local settings and location cache, local
notifications, Focus Mode windows, bundled audio, launch-at-login registration,
direct Sparkle updates, App Store packaging, and release automation.

There is no Nakafa backend, account, analytics pipeline, content upload, remote
audio provider, or remote command channel.

## Assets and boundaries

| Asset | Required property | Boundary |
| --- | --- | --- |
| Coordinates and local label | Confidentiality | Core Location or user input to local cache |
| Calculation preferences | Integrity | Settings UI to local preferences |
| Notification plan | Integrity and availability | Planner to macOS notification center |
| Focus Mode state | Availability and user control | App timer to local AppKit windows |
| Adhan alert | Integrity and license compliance | Audited resource to app bundle |
| Direct updates | Authenticity | Signed appcast and Developer ID release |
| App Store binary | No app-controlled network path | Source, linker, entitlement, and bundle checks |

## Primary risks and controls

| ID | Risk | Controls | Remaining validation |
| --- | --- | --- | --- |
| TM-001 | Coordinates leave the device | No geocoder or network API in shared app source; separate App Store entitlement; static network audit | Re-run audit at exact release head |
| TM-002 | Reminders silently stop | Explicit permission and error states; seven-day local notification reconciliation; app-owned IDs only | Sleep, quit, revoke, timezone, and midnight manual QA |
| TM-003 | Stale requests survive a setting change | Desired requests are added before stale owned IDs are removed; repeated reconciliation | Inspect pending requests during release QA |
| TM-004 | Focus Mode blocks user control | Opt-in consent; app switching preserved; real Button; confirmation; Escape; accessibility action; timeout; idempotent teardown | VoiceOver and multi-display manual QA |
| TM-005 | Wake causes an obsolete focus overlay | Five-minute maximum lateness policy with boundary tests | Sleep and wake manual QA |
| TM-006 | Corrupt preferences fail silently | Explicit recovery result and safe notification default | Corrupt-data test at release head |
| TM-007 | Untrusted or oversized sound ships | CC0 provenance, hashes, reproducible edit, CAF validation under 30 seconds | Reconfirm source metadata before release |
| TM-008 | App Store binary gains a network path | Dedicated executable, no Sparkle, no network-client entitlement, source and linked-framework audit | Archive-level App Store validation |
| TM-009 | Supply-chain workflow changes execute mutable code | GitHub Actions pinned to immutable commit SHAs; SwiftPM lockfile retained | Dependency review and exact-head CI |

## Trust decisions

- Core Location is used only through `CLLocationManager` for one-shot coordinates.
- User Notifications owns delivery while the app sleeps or is closed.
- Direct builds trust Sparkle only when signed update metadata is configured.
- App Store builds trust the Mac App Store update channel and contain no updater.
- The bundled CC0 alert is the only audio source.

## Review triggers

Repeat this threat model before adding any backend, telemetry, remote content,
new audio, account system, deep link, automation interface, or network-dependent
feature. Treat any App Store network entitlement or network API addition as a
release-blocking architecture change.
