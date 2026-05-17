import Foundation

/// User-selectable language mode for the app.
///
/// `system` keeps the app aligned with macOS language preferences. Concrete
/// language cases are stable IDs that can be stored safely in user defaults.
public enum AppLanguage: String, CaseIterable, Codable, Identifiable, Sendable {
  case system
  case english = "en"
  case indonesian = "id"

  public var id: String { rawValue }

  /// Resolves a stored language value to a supported BCP-47 language code.
  ///
  /// Unsupported stored values and unsupported system languages fall back to
  /// English so every user-facing string has a deterministic language.
  public static func resolvedIdentifier(
    storedValue: String,
    preferredLanguages: [String] = Locale.preferredLanguages
  ) -> String {
    guard storedValue == Self.system.rawValue else {
      return supportedIdentifier(for: storedValue) ?? Self.english.rawValue
    }

    for language in preferredLanguages {
      if let supported = supportedIdentifier(for: language) {
        return supported
      }
    }

    return Self.english.rawValue
  }

  /// The language code used for localization lookup at runtime.
  public var resolvedIdentifier: String {
    Self.resolvedIdentifier(storedValue: rawValue)
  }

  private static func supportedIdentifier(for value: String) -> String? {
    let identifier = Locale(identifier: value).language.languageCode?.identifier ?? value

    if identifier == Self.indonesian.rawValue {
      return Self.indonesian.rawValue
    }

    if identifier == Self.english.rawValue {
      return Self.english.rawValue
    }

    return nil
  }
}
