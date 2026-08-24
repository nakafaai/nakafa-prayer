import XCTest

@testable import NakafaPrayerCore

final class AppLanguageTests: XCTestCase {
  func testSystemLanguageUsesSupportedPreferredLanguage() {
    let resolved = AppLanguage.resolvedIdentifier(
      storedValue: AppLanguage.system.rawValue,
      preferredLanguages: ["id-ID", "en-US"]
    )

    XCTAssertEqual(resolved, "id")
  }

  func testUnsupportedLanguageFallsBackToEnglish() {
    let resolved = AppLanguage.resolvedIdentifier(
      storedValue: "fr",
      preferredLanguages: ["fr-FR"]
    )

    XCTAssertEqual(resolved, "en")
  }
}
