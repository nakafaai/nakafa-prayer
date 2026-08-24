import Foundation
import XCTest

@testable import NakafaPrayerCore

final class PrayerCalculatorTests: XCTestCase {
  func testFixedPrayerTimesMatchAdhanLibraryReference() throws {
    let settings = PrayerSettings(
      calculationMethod: .muslimWorldLeague,
      madhab: .shafi
    )
    let coordinates = PrayerCoordinates(latitude: 35.7750, longitude: -78.6336)
    let date = try utcDate(year: 2015, month: 12, day: 1)

    let schedule = try PrayerCalculator(calendar: .gregorianUTC).schedule(
      for: date,
      coordinates: coordinates,
      settings: settings
    )
    var localCalendar = Calendar(identifier: .gregorian)
    localCalendar.timeZone = try XCTUnwrap(TimeZone(identifier: "America/New_York"))

    try assertTime(.fajr, hour: 5, minute: 35, in: schedule, calendar: localCalendar)
    try assertTime(.dhuhr, hour: 12, minute: 5, in: schedule, calendar: localCalendar)
    try assertTime(.asr, hour: 14, minute: 42, in: schedule, calendar: localCalendar)
    try assertTime(.maghrib, hour: 17, minute: 1, in: schedule, calendar: localCalendar)
    try assertTime(.isha, hour: 18, minute: 26, in: schedule, calendar: localCalendar)
  }

  func testInvalidCoordinatesFailEarly() {
    XCTAssertThrowsError(
      try PrayerCalculator(calendar: .gregorianUTC).schedule(
        for: Date(),
        coordinates: PrayerCoordinates(latitude: 999, longitude: 999),
        settings: PrayerSettings()
      )
    ) { error in
      XCTAssertEqual(error as? PrayerCalculationError, .invalidCoordinates)
    }
  }

  private func assertTime(
    _ prayer: PrayerID,
    hour: Int,
    minute: Int,
    in schedule: DailyPrayerSchedule,
    calendar: Calendar,
    file: StaticString = #filePath,
    line: UInt = #line
  ) throws {
    let time = try XCTUnwrap(schedule.times.first { $0.prayer == prayer }?.date)
    let components = calendar.dateComponents([.hour, .minute], from: time)
    XCTAssertEqual(components.hour, hour, file: file, line: line)
    XCTAssertEqual(components.minute, minute, file: file, line: line)
  }

  private func utcDate(year: Int, month: Int, day: Int) throws -> Date {
    try XCTUnwrap(
      Calendar.gregorianUTC.date(
        from: DateComponents(
          year: year,
          month: month,
          day: day
        ))
    )
  }
}
