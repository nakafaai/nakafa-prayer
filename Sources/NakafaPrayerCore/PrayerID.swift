import Adhan
import Foundation

/// Stable identifiers for the five wajib prayers that trigger reminders.
public enum PrayerID: String, CaseIterable, Codable, Identifiable, Sendable {
  case fajr
  case dhuhr
  case asr
  case maghrib
  case isha

  public var id: String { rawValue }

  /// Maps the app's stable prayer IDs to `adhan-swift` prayer cases.
  var adhanPrayer: Prayer {
    switch self {
    case .fajr:
      return .fajr
    case .dhuhr:
      return .dhuhr
    case .asr:
      return .asr
    case .maghrib:
      return .maghrib
    case .isha:
      return .isha
    }
  }

  /// String Catalog key for the localized prayer name.
  public var localizationKey: String {
    "prayer.\(rawValue)"
  }
}
