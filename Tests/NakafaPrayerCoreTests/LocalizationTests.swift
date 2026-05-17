import Testing

@testable import NakafaPrayerCore

@Suite
struct LocalizationTests {
  @Test
  func indonesianPrayerName() {
    let localizer = Localizer(language: .indonesian)

    #expect(localizer.prayerName(.dhuhr) == "Zuhur")
  }

  @Test
  func englishFallback() {
    let resolved = AppLanguage.resolvedIdentifier(
      storedValue: "zz",
      preferredLanguages: ["zz-ZZ"]
    )

    #expect(resolved == "en")
  }
}
