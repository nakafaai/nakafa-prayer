# Editor Setup

## Zed

Zed works for this repository because the project is a Swift Package Manager
workspace with `Package.swift` at the root.

Open it with:

```bash
zed /Users/nabilfatih/Code/nakafa-prayer
```

The repo includes:

- `.zed/settings.json` for Swift format-on-save through the language server.
- `.zed/tasks.json` for build, test, localization check, and app bundle tasks.
- `.sourcekit-lsp/config.json` so SourceKit-LSP treats the repo as SwiftPM.

Local verification:

- Zed CLI is installed at `/usr/local/bin/zed`.
- `sourcekit-lsp` is available at `/usr/bin/sourcekit-lsp`.
- `swift format` is available through the installed Swift 6.2.3 toolchain.

## Xcode

Xcode is still useful for app signing, notarization, entitlements inspection,
App Store Connect workflows, Instruments, and deeper macOS debugging.

Open the package directly in Xcode:

```bash
open -a Xcode /Users/nabilfatih/Code/nakafa-prayer/Package.swift
```

Do not generate an `.xcodeproj`; modern Xcode opens Swift packages directly.
