import Foundation

public struct Localizer: Sendable {
    public var language: AppLanguage
    private static let catalog = StringCatalog.load()

    public init(language: AppLanguage) {
        self.language = language
    }

    public var localeIdentifier: String {
        language.resolvedIdentifier
    }

    public var locale: Locale {
        Locale(identifier: localeIdentifier)
    }

    public func text(_ key: String) -> String {
        Self.catalog.value(for: key, language: localeIdentifier) ?? key
    }

    public func text(_ key: String, _ arguments: CVarArg...) -> String {
        let format = text(key)
        return String(format: format, locale: locale, arguments: arguments)
    }

    public func prayerName(_ prayer: PrayerID) -> String {
        text(prayer.localizationKey)
    }
}

private struct StringCatalog: Decodable, Sendable {
    let strings: [String: CatalogEntry]

    static func load() -> StringCatalog {
        guard let url = Bundle.module.url(forResource: "Localizable", withExtension: "xcstrings"),
              let data = try? Data(contentsOf: url),
              let catalog = try? JSONDecoder().decode(StringCatalog.self, from: data) else {
            return StringCatalog(strings: [:])
        }

        return catalog
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
