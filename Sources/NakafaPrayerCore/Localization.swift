import Foundation

/// Localized string lookup backed by Apple's String Catalog file.
///
/// SwiftPM currently ships the `.xcstrings` file as a resource for this package
/// shape, so the helper reads the catalog directly while keeping it as the
/// source of truth.
public struct Localizer: Sendable {
  /// Language used for lookup.
  public var language: AppLanguage
  private static let catalog = StringCatalog.load()

  /// Creates a localizer for the selected app language.
  public init(language: AppLanguage) {
    self.language = language
  }

  /// The resolved BCP-47 language code used by SwiftUI, AppKit, TTS, and formatters.
  public var localeIdentifier: String {
    language.resolvedIdentifier
  }

  /// Foundation locale for date, number, and speech formatting.
  public var locale: Locale {
    Locale(identifier: localeIdentifier)
  }

  /// Returns a localized string for a catalog key.
  public func text(_ key: String) -> String {
    Self.catalog.value(for: key, language: localeIdentifier) ?? key
  }

  /// Returns a formatted localized string for a catalog key.
  public func text(_ key: String, _ arguments: CVarArg...) -> String {
    let format = text(key)
    return String(format: format, locale: locale, arguments: arguments)
  }

  /// Returns the localized display name for a prayer.
  public func prayerName(_ prayer: PrayerID) -> String {
    text(prayer.localizationKey)
  }
}

private struct StringCatalog: Decodable, Sendable {
  let strings: [String: CatalogEntry]

  static func load() -> StringCatalog {
    guard let url = catalogURL(),
      let data = try? Data(contentsOf: url),
      let catalog = try? JSONDecoder().decode(StringCatalog.self, from: data)
    else {
      return StringCatalog(strings: [:])
    }

    return catalog
  }

  private static func catalogURL() -> URL? {
    let appBundle = Bundle.main.resourceURL?.appendingPathComponent(
      "nakafa-prayer_NakafaPrayerCore.bundle")

    if let appBundle,
      let bundle = Bundle(url: appBundle),
      let url = bundle.url(forResource: "Localizable", withExtension: "xcstrings")
    {
      return url
    }

    guard Bundle.main.bundleURL.pathExtension != "app" else {
      return nil
    }

    return Bundle.module.url(forResource: "Localizable", withExtension: "xcstrings")
  }

  func value(for key: String, language: String) -> String? {
    let localizations = strings[key]?.localizations
    return localizations?[language]?.stringUnit.value ?? localizations?["en"]?.stringUnit.value
  }
}

private struct CatalogEntry: Decodable, Sendable {
  let localizations: [String: CatalogLocalization]?
}

private struct CatalogLocalization: Decodable, Sendable {
  let stringUnit: CatalogStringUnit
}

private struct CatalogStringUnit: Decodable, Sendable {
  let value: String
}
