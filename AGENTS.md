# Nakafa Prayer Agent Guide

Build for longevity. Keep the app small, readable, and easy to verify.

- Read nearby code before editing.
- Prefer direct Swift and Apple frameworks over wrappers.
- Keep files focused and under 300 LOC when possible.
- Add Swift documentation comments (`///`) to public APIs and non-obvious app services.
- If JavaScript or TypeScript is added later, document public APIs with JSDoc.
- Use stable IDs for settings, prayers, and localization keys.
- Do not add Electron, Tauri, or TypeScript runtime code to the macOS app.
- Keep user data local. Location must never leave the device.
- Run `swift test` after core changes.
- Run `swift build` after app changes.
- Do not commit or push unless explicitly asked.
