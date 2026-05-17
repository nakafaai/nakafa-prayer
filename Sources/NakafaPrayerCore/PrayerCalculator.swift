import Adhan
import Foundation

/// One prayer occurrence on a specific date.
public struct PrayerTime: Equatable, Identifiable, Sendable {
  /// Prayer that becomes due.
  public var prayer: PrayerID

  /// Absolute instant when the prayer becomes due.
  public var date: Date

  /// Stable list identity for SwiftUI and tests.
  public var id: PrayerID { prayer }
}

/// Prayer times for one local calendar day.
public struct DailyPrayerSchedule: Equatable, Sendable {
  /// Date used as the schedule input.
  public var date: Date

  /// Five wajib prayer times in chronological prayer order.
  public var times: [PrayerTime]

  /// Returns the first prayer strictly after `now`.
  public func nextPrayer(after now: Date) -> PrayerTime? {
    times.first { $0.date > now }
  }
}

/// Failures that can happen while calculating prayer times.
public enum PrayerCalculationError: Error, Equatable, Sendable {
  case invalidCoordinates
  case unavailableTimes
}

/// Calculates prayer schedules using `adhan-swift`.
///
/// The default calendar is `.current` so day boundaries match the user's local
/// timezone. Tests can inject a fixed UTC calendar for deterministic snapshots.
public struct PrayerCalculator: Sendable {
  private let calendar: Calendar

  /// Creates a calculator with the calendar used to choose the local day.
  public init(calendar: Calendar = .current) {
    self.calendar = calendar
  }

  /// Calculates the five wajib prayer times for the provided day and coordinates.
  public func schedule(
    for date: Date,
    coordinates: PrayerCoordinates,
    settings: PrayerSettings
  ) throws -> DailyPrayerSchedule {
    guard coordinates.isValid else {
      throw PrayerCalculationError.invalidCoordinates
    }

    var parameters = settings.calculationMethod.adhanMethod.params
    parameters.madhab = settings.madhab.adhanMadhab

    let day = calendar.dateComponents([.year, .month, .day], from: date)
    let adhanCoordinates = Coordinates(
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    )

    guard
      let prayerTimes = PrayerTimes(
        coordinates: adhanCoordinates,
        date: day,
        calculationParameters: parameters
      )
    else {
      throw PrayerCalculationError.unavailableTimes
    }

    let times = PrayerID.allCases.map { prayer in
      PrayerTime(prayer: prayer, date: prayerTimes.time(for: prayer.adhanPrayer))
    }

    return DailyPrayerSchedule(date: date, times: times)
  }
}

extension Calendar {
  /// Deterministic UTC Gregorian calendar for tests and fixed reference data.
  public static var gregorianUTC: Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(identifier: "UTC")!
    return calendar
  }
}
