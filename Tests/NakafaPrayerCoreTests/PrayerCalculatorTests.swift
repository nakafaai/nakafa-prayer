import Foundation
import Testing
@testable import NakafaPrayerCore

@Suite
struct PrayerCalculatorTests {
    @Test
    func fixedPrayerTimesMatchAdhanLibraryReference() throws {
        let settings = PrayerSettings(
            calculationMethod: .muslimWorldLeague,
            madhab: .shafi
        )
        let coordinates = PrayerCoordinates(latitude: 35.7750, longitude: -78.6336)
        let date = utcDate(year: 2015, month: 12, day: 1)

        let schedule = try PrayerCalculator().schedule(
            for: date,
            coordinates: coordinates,
            settings: settings
        )

        let formatter = DateFormatter()
        formatter.timeZone = TimeZone(identifier: "America/New_York")!
        formatter.dateStyle = .none
        formatter.timeStyle = .short

        #expect(formatter.string(from: time(.fajr, in: schedule)) == "5:35 AM")
        #expect(formatter.string(from: time(.dhuhr, in: schedule)) == "12:05 PM")
        #expect(formatter.string(from: time(.asr, in: schedule)) == "2:42 PM")
        #expect(formatter.string(from: time(.maghrib, in: schedule)) == "5:01 PM")
        #expect(formatter.string(from: time(.isha, in: schedule)) == "6:26 PM")
    }

    @Test
    func invalidCoordinatesFailEarly() {
        #expect(throws: PrayerCalculationError.invalidCoordinates) {
            try PrayerCalculator().schedule(
                for: Date(),
                coordinates: PrayerCoordinates(latitude: 999, longitude: 999),
                settings: PrayerSettings()
            )
        }
    }

    private func time(_ prayer: PrayerID, in schedule: DailyPrayerSchedule) -> Date {
        schedule.times.first { $0.prayer == prayer }!.date
    }

    private func utcDate(year: Int, month: Int, day: Int) -> Date {
        Calendar.gregorianUTC.date(from: DateComponents(
            year: year,
            month: month,
            day: day
        ))!
    }
}
