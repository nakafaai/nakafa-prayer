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

  var adhanMethod: CalculationMethod {
    CalculationMethod(rawValue: rawValue) ?? .muslimWorldLeague
  }
}

/// Stable IDs for the Asr madhab setting.
public enum MadhabID: String, CaseIterable, Codable, Identifiable, Sendable {
  case shafi
  case hanafi

  public var id: String { rawValue }

  var adhanMadhab: Madhab {
    switch self {
    case .shafi:
      return .shafi
    case .hanafi:
      return .hanafi
    }
  }
}

/// User-selectable reminder behavior.
public enum ReminderMode: String, CaseIterable, Codable, Identifiable, Sendable {
  case notification
  case focus

  public var id: String { rawValue }
}

/// Source used for local prayer-time coordinates.
public enum LocationMode: String, CaseIterable, Codable, Identifiable, Sendable {
  case automatic
  case manual

  public var id: String { rawValue }
}

/// User preferences stored locally in macOS user defaults.
public struct PrayerSettings: Codable, Equatable, Sendable {
  /// Current encoded settings schema.
  public static let currentSchemaVersion = 2

  /// Consent version required before Focus Mode may start automatically.
  public static let currentFocusConsentVersion = 1

  /// Selected app language.
  public var language: AppLanguage

  /// Prayer-time calculation method.
  public var calculationMethod: CalculationMethodID

  /// Asr shadow-length school.
  public var madhab: MadhabID

  /// Reminder behavior. Existing installs migrate to notifications.
  public var reminderMode: ReminderMode

  /// Version of the Focus Mode disclosure accepted by the user.
  public var focusConsentVersion: Int

  /// Focus Mode duration in minutes before clamping.
  public var focusDurationMinutes: Int

  /// Whether the app should register itself as a login item.
  public var launchAtLogin: Bool

  /// Whether the local adhan alert should play with notifications.
  public var adhanEnabled: Bool

  /// Coordinate source used for prayer-time calculations.
  public var locationMode: LocationMode

  /// Coordinates explicitly entered by the user.
  public var manualCoordinates: PrayerCoordinates?

  /// Optional user-entered label that never leaves the device.
  public var manualLocationLabel: String?

  /// Creates settings with safe defaults for a first launch.
  public init(
    language: AppLanguage = .system,
    calculationMethod: CalculationMethodID = .muslimWorldLeague,
    madhab: MadhabID = .shafi,
    reminderMode: ReminderMode = .notification,
    focusConsentVersion: Int = 0,
    focusDurationMinutes: Int = 10,
    launchAtLogin: Bool = false,
    adhanEnabled: Bool = true,
    locationMode: LocationMode = .automatic,
    manualCoordinates: PrayerCoordinates? = nil,
    manualLocationLabel: String? = nil
  ) {
    self.language = language
    self.calculationMethod = calculationMethod
    self.madhab = madhab
    self.reminderMode = reminderMode
    self.focusConsentVersion = focusConsentVersion
    self.focusDurationMinutes = focusDurationMinutes
    self.launchAtLogin = launchAtLogin
    self.adhanEnabled = adhanEnabled
    self.locationMode = locationMode
    self.manualCoordinates = manualCoordinates?.isValid == true ? manualCoordinates : nil
    self.manualLocationLabel = Self.normalizedLabel(manualLocationLabel)
  }

  /// Whether the saved Focus Mode selection has current informed consent.
  public var isFocusModeEnabled: Bool {
    reminderMode == .focus && focusConsentVersion == Self.currentFocusConsentVersion
  }

  /// Focus duration in seconds, constrained to the supported 1-60 minute range.
  public var clampedFocusDuration: TimeInterval {
    TimeInterval(min(max(focusDurationMinutes, 1), 60) * 60)
  }

  private static func normalizedLabel(_ value: String?) -> String? {
    guard let value else {
      return nil
    }

    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }
}

extension PrayerSettings {
  private enum CodingKeys: String, CodingKey {
    case schemaVersion
    case language
    case calculationMethod
    case madhab
    case reminderMode
    case focusConsentVersion
    case focusDurationMinutes
    case lockDurationMinutes
    case launchAtLogin
    case adhanEnabled
    case locationMode
    case useManualCoordinates
    case manualCoordinates
    case manualLocationLabel
  }

  /// Decodes schema v2 and safely migrates legacy settings.
  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    let storedSchema = try container.decodeIfPresent(Int.self, forKey: .schemaVersion) ?? 1

    language = try container.decodeIfPresent(AppLanguage.self, forKey: .language) ?? .system
    calculationMethod =
      try container.decodeIfPresent(CalculationMethodID.self, forKey: .calculationMethod)
      ?? .muslimWorldLeague
    madhab = try container.decodeIfPresent(MadhabID.self, forKey: .madhab) ?? .shafi
    launchAtLogin = try container.decodeIfPresent(Bool.self, forKey: .launchAtLogin) ?? false
    adhanEnabled = try container.decodeIfPresent(Bool.self, forKey: .adhanEnabled) ?? true

    focusDurationMinutes =
      try container.decodeIfPresent(Int.self, forKey: .focusDurationMinutes)
      ?? container.decodeIfPresent(Int.self, forKey: .lockDurationMinutes)
      ?? 10

    if storedSchema >= Self.currentSchemaVersion {
      let decodedMode =
        try container.decodeIfPresent(ReminderMode.self, forKey: .reminderMode) ?? .notification
      focusConsentVersion =
        try container.decodeIfPresent(Int.self, forKey: .focusConsentVersion) ?? 0
      reminderMode =
        decodedMode == .focus && focusConsentVersion == Self.currentFocusConsentVersion
        ? .focus
        : .notification
      locationMode =
        try container.decodeIfPresent(LocationMode.self, forKey: .locationMode) ?? .automatic
      manualCoordinates = try container.decodeIfPresent(
        PrayerCoordinates.self,
        forKey: .manualCoordinates
      )
      manualLocationLabel = Self.normalizedLabel(
        try container.decodeIfPresent(String.self, forKey: .manualLocationLabel)
      )
    } else {
      reminderMode = .notification
      focusConsentVersion = 0

      let usedManualCoordinates =
        try container.decodeIfPresent(Bool.self, forKey: .useManualCoordinates) ?? false
      locationMode = usedManualCoordinates ? .manual : .automatic
      let legacyCoordinates = try container.decodeIfPresent(
        PrayerCoordinates.self,
        forKey: .manualCoordinates
      )
      manualCoordinates =
        usedManualCoordinates && legacyCoordinates?.isValid == true
        ? legacyCoordinates
        : nil
      manualLocationLabel = nil
    }

    if manualCoordinates?.isValid == false {
      manualCoordinates = nil
    }
  }

  /// Encodes only the current schema and excludes retired network-derived data.
  public func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(Self.currentSchemaVersion, forKey: .schemaVersion)
    try container.encode(language, forKey: .language)
    try container.encode(calculationMethod, forKey: .calculationMethod)
    try container.encode(madhab, forKey: .madhab)
    try container.encode(reminderMode, forKey: .reminderMode)
    try container.encode(focusConsentVersion, forKey: .focusConsentVersion)
    try container.encode(focusDurationMinutes, forKey: .focusDurationMinutes)
    try container.encode(launchAtLogin, forKey: .launchAtLogin)
    try container.encode(adhanEnabled, forKey: .adhanEnabled)
    try container.encode(locationMode, forKey: .locationMode)
    try container.encodeIfPresent(manualCoordinates, forKey: .manualCoordinates)
    try container.encodeIfPresent(manualLocationLabel, forKey: .manualLocationLabel)
  }
}
