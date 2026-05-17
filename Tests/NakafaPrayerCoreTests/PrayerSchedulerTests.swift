import Foundation
import Testing
@testable import NakafaPrayerCore

@Suite
struct PrayerSchedulerTests {
    @Test
    func nextPrayerRollsToTomorrowAfterIsha() throws {
        let settings = PrayerSettings()
        let coordinates = PrayerCoordinates(latitude: -6.2, longitude: 106.816_666)
        let now = Calendar.gregorianUTC.date(from: DateComponents(
            year: 2026,
            month: 5,
            day: 17,
            hour: 23
        ))!

        let next = try NextPrayerResolver().nextPrayer(
            after: now,
            coordinates: coordinates,
            settings: settings
        )

        #expect(next.prayer == .fajr)
        #expect(next.date > now)
    }
}
