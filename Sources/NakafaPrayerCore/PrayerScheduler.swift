import Foundation

/// Stable identity for one prayer occurrence on one local calendar day.
public struct PrayerOccurrenceID: RawRepresentable, Codable, Hashable, Sendable {
  public var rawValue: String

  /// Creates an ID from its persisted representation.
  public init(rawValue: String) {
    self.rawValue = rawValue
  }

  /// Creates an ID from a local day and prayer.
  public init(date: Date, prayer: PrayerID, calendar: Calendar) {
    let components = calendar.dateComponents([.year, .month, .day], from: date)
    let year = components.year ?? 0
    let month = components.month ?? 0
    let day = components.day ?? 0
    rawValue = String(
      format: "%04d-%02d-%02d.%@",
      locale: Locale(identifier: "en_US_POSIX"),
      year,
      month,
      day,
      prayer.rawValue
    )
  }
}

/// One future prayer occurrence with stable multi-day identity.
public struct PrayerOccurrence: Equatable, Identifiable, Sendable {
  public var id: PrayerOccurrenceID
  public var prayer: PrayerID
  public var date: Date

  /// Creates a planned prayer occurrence.
  public init(id: PrayerOccurrenceID, prayer: PrayerID, date: Date) {
    self.id = id
    self.prayer = prayer
    self.date = date
  }
}

/// Produces deterministic multi-day prayer occurrences for reminders.
public struct PrayerSchedulePlanner: Sendable {
  private let calculator: PrayerCalculator
  private let calendar: Calendar

  /// Creates a planner from a calculator and local calendar.
  public init(
    calculator: PrayerCalculator = PrayerCalculator(),
    calendar: Calendar = .autoupdatingCurrent
  ) {
    self.calculator = calculator
    self.calendar = calendar
  }

  /// Returns future prayer occurrences across a rolling local-day horizon.
  public func occurrences(
    startingAt now: Date,
    days: Int = 7,
    coordinates: PrayerCoordinates,
    settings: PrayerSettings
  ) throws -> [PrayerOccurrence] {
    guard days > 0 else {
      return []
    }

    var result: [PrayerOccurrence] = []

    for dayOffset in 0..<days {
      guard let date = calendar.date(byAdding: .day, value: dayOffset, to: now) else {
        throw PrayerCalculationError.unavailableTimes
      }

      let schedule = try calculator.schedule(
        for: date,
        coordinates: coordinates,
        settings: settings
      )

      for time in schedule.times where time.date > now {
        result.append(
          PrayerOccurrence(
            id: PrayerOccurrenceID(date: time.date, prayer: time.prayer, calendar: calendar),
            prayer: time.prayer,
            date: time.date
          )
        )
      }
    }

    return result.sorted { $0.date < $1.date }
  }
}
