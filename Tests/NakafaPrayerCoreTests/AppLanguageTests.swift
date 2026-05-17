import Testing
@testable import NakafaPrayerCore

@Suite
struct AppLanguageTests {
    @Test
    func systemLanguageUsesSupportedPreferredLanguage() {
        let resolved = AppLanguage.resolvedIdentifier(
            storedValue: AppLanguage.system.rawValue,
            preferredLanguages: ["id-ID", "en-US"]
        )

        #expect(resolved == "id")
    }

    @Test
    func unsupportedLanguageFallsBackToEnglish() {
        let resolved = AppLanguage.resolvedIdentifier(
            storedValue: "fr",
            preferredLanguages: ["fr-FR"]
        )

        #expect(resolved == "en")
    }
}
