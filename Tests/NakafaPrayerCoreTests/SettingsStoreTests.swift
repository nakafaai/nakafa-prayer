import Foundation
import Testing
@testable import NakafaPrayerCore

@Suite
struct SettingsStoreTests {
    @Test
    func roundTripSettings() {
        let defaults = UserDefaults(suiteName: "ai.nakafa.prayer.tests.\(UUID().uuidString)")!
        let store = SettingsStore(defaults: defaults)
        var settings = PrayerSettings()
        settings.language = .indonesian
        settings.lockDurationMinutes = 12

        store.save(settings)

        #expect(store.load() == settings)
    }
}
