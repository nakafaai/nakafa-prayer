# Editor Setup

## Zed

Zed works for this repository because the project is a Swift Package Manager
workspace with `Package.swift` at the root.

Open it with:

```bash
zed .
```

The repo includes:

- `.zed/settings.json` for Swift format-on-save through the language server.
- `.zed/tasks.json` for build, test, localization check, and app bundle tasks.
- `.sourcekit-lsp/config.json` so SourceKit-LSP treats the repo as SwiftPM.

Useful checks:

```bash
swift --version
swift build
swift test
swift scripts/check-localization.swift
```

If `swift test` cannot find `XCTest`, install or select a complete Xcode
toolchain and accept Apple's Xcode license. The test suite intentionally uses
XCTest so contributors do not need a separate test framework dependency.

## Xcode

Xcode is still useful for app signing, notarization, entitlements inspection,
App Store Connect workflows, Instruments, and deeper macOS debugging.

Open the package directly in Xcode:

```bash
open -a Xcode Package.swift
```

Do not generate an `.xcodeproj`; modern Xcode opens Swift packages directly.
