# Contributing

Thanks for helping improve Nakafa Prayer.

## Setup

```bash
git clone https://github.com/nakafaai/nakafa-prayer.git
cd nakafa-prayer
swift test
swift build
```

## Standards

- Keep Swift code direct and skimmable.
- Prefer Apple framework APIs before adding dependencies.
- Keep user-facing strings in `Localizable.xcstrings`.
- Store stable IDs, not localized labels.
- Do not include secrets, private coordinates, or licensed audio without rights.

## Pull Requests

1. Branch from `main`.
2. Keep the change focused.
3. Run `swift test` and `swift build`.
4. Explain user-visible behavior and verification in the PR.
