import XCTest

@testable import NakafaPrayerCore

final class LocalizationTests: XCTestCase {
  func testIndonesianPrayerName() {
    let localizer = Localizer(language: .indonesian)

    XCTAssertEqual(localizer.prayerName(.dhuhr), "Zuhur")
  }

  func testEnglishFallback() {
    let resolved = AppLanguage.resolvedIdentifier(
      storedValue: "zz",
      preferredLanguages: ["zz-ZZ"]
    )

    XCTAssertEqual(resolved, "en")
  }
}
