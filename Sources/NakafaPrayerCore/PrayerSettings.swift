import Adhan
import Foundation

/// Stable IDs for prayer-time calculation methods supported by `adhan-swift`.
public enum CalculationMethodID: String, CaseIterable, Codable, Identifiable, Sendable {
  case muslimWorldLeague
  case egyptian
  case karachi
  case ummAlQura
  case dubai
  case moonsightingCommittee
  case northAmerica
  case kuwait
  case qatar
  case singapore
  case tehran
  case turkey

  public var id: String { rawValue }

  /// The `adhan-swift` calculation method used by the calculator.
  var adhanMethod: CalculationMethod {
    CalculationMethod(rawValue: rawValue) ?? .muslimWorldLeague
  }
}

/// Stable IDs for the Asr madhab setting.
public enum MadhabID: String, CaseIterable, Codable, Identifiable, Sendable {
  case shafi
  case hanafi

  public var id: String { rawValue }

  /// The `adhan-swift` madhab used to calculate Asr.
  var adhanMadhab: Madhab {
    switch self {
    case .shafi:
      return .shafi
    case .hanafi:
      return .hanafi
    }
  }
}

/// User preferences stored locally in macOS user defaults.
///
/// The struct only stores stable IDs and raw values. Localized labels are
/// resolved at render time so changing languages does not corrupt settings.
public struct PrayerSettings: Codable, Equatable, Sendable {
  /// Selected app language.
  public var language: AppLanguage

  /// Prayer-time calculation method.
  public var calculationMethod: CalculationMethodID

  /// Asr shadow-length school.
  public var madhab: MadhabID

  /// Lock duration in minutes before clamping.
  public var lockDurationMinutes: Int

  /// Whether the app should register itself as a login item.
  public var launchAtLogin: Bool

  /// Whether bundled adhan audio should play when available.
  public var adhanEnabled: Bool

  /// Whether macOS text-to-speech should speak the localized reminder.
  public var ttsEnabled: Bool

  /// Whether manual coordinates override Core Location.
  public var useManualCoordinates: Bool

  /// Coordinates entered by the user.
  public var manualCoordinates: PrayerCoordinates

  /// Most recent valid Core Location result.
  public var lastKnownCoordinates: PrayerCoordinates?

  /// Creates settings with safe defaults for a first launch.
  public init(
    language: AppLanguage = .system,
    calculationMethod: CalculationMethodID = .muslimWorldLeague,
    madhab: MadhabID = .shafi,
    lockDurationMinutes: Int = 10,
    launchAtLogin: Bool = false,
    adhanEnabled: Bool = true,
    ttsEnabled: Bool = true,
    useManualCoordinates: Bool = false,
    manualCoordinates: PrayerCoordinates = PrayerCoordinates(
      latitude: -6.2, longitude: 106.816_666),
    lastKnownCoordinates: PrayerCoordinates? = nil
  ) {
    self.language = language
    self.calculationMethod = calculationMethod
    self.madhab = madhab
    self.lockDurationMinutes = lockDurationMinutes
    self.launchAtLogin = launchAtLogin
    self.adhanEnabled = adhanEnabled
    self.ttsEnabled = ttsEnabled
    self.useManualCoordinates = useManualCoordinates
    self.manualCoordinates = manualCoordinates
    self.lastKnownCoordinates = lastKnownCoordinates
  }

  /// Coordinates currently eligible for calculation.
  ///
  /// Manual coordinates win when enabled. Otherwise the app uses the last
  /// valid Core Location result.
  public var activeCoordinates: PrayerCoordinates? {
    if useManualCoordinates, manualCoordinates.isValid {
      return manualCoordinates
    }

    guard let lastKnownCoordinates, lastKnownCoordinates.isValid else {
      return nil
    }

    return lastKnownCoordinates
  }

  /// Lock duration in seconds, constrained to the supported 1-60 minute range.
  public var clampedLockDuration: TimeInterval {
    TimeInterval(min(max(lockDurationMinutes, 1), 60) * 60)
  }
}
