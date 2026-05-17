import Foundation

/// Resolves the next future prayer across day boundaries.
///
/// Prayer times are absolute `Date` values. The resolver scans forward instead
/// of assuming "tomorrow's first prayer" is always in the future, which avoids
/// timezone edge cases near midnight UTC.
public struct NextPrayerResolver: Sendable {
  private let calculator: PrayerCalculator
  private let calendar: Calendar

  /// Creates a resolver from a calculator and calendar.
  public init(
    calculator: PrayerCalculator = PrayerCalculator(),
    calendar: Calendar = .current
  ) {
    self.calculator = calculator
    self.calendar = calendar
  }

  /// Returns the next prayer strictly after `now`.
  public func nextPrayer(
    after now: Date,
    coordinates: PrayerCoordinates,
    settings: PrayerSettings
  ) throws -> PrayerTime {
    let today = try calculator.schedule(
      for: now,
      coordinates: coordinates,
      settings: settings
    )

    if let next = today.nextPrayer(after: now) {
      return next
    }

    for dayOffset in 1...7 {
      let date = calendar.date(byAdding: .day, value: dayOffset, to: now) ?? now
      let schedule = try calculator.schedule(
        for: date,
        coordinates: coordinates,
        settings: settings
      )

      if let next = schedule.nextPrayer(after: now) {
        return next
      }
    }

    throw PrayerCalculationError.unavailableTimes
  }
}
