import Foundation
import XCTest

@testable import NakafaPrayerCore

final class PrayerSchedulerTests: XCTestCase {
  func testPlannerBuildsSevenDaysWithStableUniqueIDs() throws {
    let now = try XCTUnwrap(
      Calendar.gregorianUTC.date(
        from: DateComponents(year: 2015, month: 12, day: 1))
    )
    let occurrences = try PrayerSchedulePlanner(
      calculator: PrayerCalculator(calendar: .gregorianUTC),
      calendar: .gregorianUTC
    ).occurrences(
      startingAt: now,
      coordinates: PrayerCoordinates(latitude: 35.7750, longitude: -78.6336),
      settings: PrayerSettings()
    )

    XCTAssertEqual(occurrences.count, 35)
    XCTAssertEqual(occurrences.first?.id.rawValue, "2015-12-01.fajr")
    XCTAssertEqual(Set(occurrences.map(\.id)).count, occurrences.count)
    XCTAssertEqual(occurrences, occurrences.sorted { $0.date < $1.date })
  }

  func testPlannerSkipsElapsedPrayersAndRollsAcrossMidnight() throws {
    let now = try XCTUnwrap(
      Calendar.gregorianUTC.date(
        from: DateComponents(year: 2026, month: 5, day: 17, hour: 20))
    )
    let occurrences = try PrayerSchedulePlanner(
      calculator: PrayerCalculator(calendar: .gregorianUTC),
      calendar: .gregorianUTC
    ).occurrences(
      startingAt: now,
      coordinates: PrayerCoordinates(latitude: -6.2, longitude: 106.816_666),
      settings: PrayerSettings()
    )

    XCTAssertEqual(occurrences.first?.prayer, .fajr)
    XCTAssertGreaterThan(try XCTUnwrap(occurrences.first?.date), now)
  }

  func testPlannerKeepsUniqueOrderedOccurrencesAcrossDST() throws {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = try XCTUnwrap(TimeZone(identifier: "America/New_York"))
    let now = try XCTUnwrap(
      calendar.date(from: DateComponents(year: 2026, month: 3, day: 7, hour: 12))
    )
    let occurrences = try PrayerSchedulePlanner(
      calculator: PrayerCalculator(calendar: calendar),
      calendar: calendar
    ).occurrences(
      startingAt: now,
      coordinates: PrayerCoordinates(latitude: 40.7128, longitude: -74.0060),
      settings: PrayerSettings()
    )

    XCTAssertFalse(occurrences.isEmpty)
    XCTAssertEqual(Set(occurrences.map(\.id)).count, occurrences.count)
    XCTAssertTrue(zip(occurrences, occurrences.dropFirst()).allSatisfy { $0.date < $1.date })
  }

  func testPlannerReturnsNoOccurrencesForEmptyHorizon() throws {
    let occurrences = try PrayerSchedulePlanner().occurrences(
      startingAt: Date(),
      days: 0,
      coordinates: PrayerCoordinates(latitude: 0, longitude: 0),
      settings: PrayerSettings()
    )

    XCTAssertTrue(occurrences.isEmpty)
  }

  func testOccurrenceIDUsesTheInjectedLocalTimezone() throws {
    let instant = try XCTUnwrap(
      Calendar.gregorianUTC.date(
        from: DateComponents(year: 2026, month: 1, day: 1, hour: 1)
      )
    )
    var losAngeles = Calendar(identifier: .gregorian)
    losAngeles.timeZone = try XCTUnwrap(TimeZone(identifier: "America/Los_Angeles"))

    let utcID = PrayerOccurrenceID(date: instant, prayer: .isha, calendar: .gregorianUTC)
    let localID = PrayerOccurrenceID(date: instant, prayer: .isha, calendar: losAngeles)

    XCTAssertEqual(utcID.rawValue, "2026-01-01.isha")
    XCTAssertEqual(localID.rawValue, "2025-12-31.isha")
  }
}
