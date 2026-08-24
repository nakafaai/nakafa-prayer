import Foundation

/// Indicates whether saved settings required recovery.
public enum SettingsRecovery: Equatable, Sendable {
  case none
  case resetCorruptData
}

/// Result of loading and, when needed, migrating local settings.
public struct SettingsLoadResult: Equatable, Sendable {
  /// Decoded settings or safe defaults after recovery.
  public var settings: PrayerSettings

  /// Recovery applied while loading.
  public var recovery: SettingsRecovery

  /// Legacy automatic coordinates that should move into `LocationCache`.
  public var migratedAutomaticCoordinates: PrayerCoordinates?

  /// Creates an explicit settings load result.
  public init(
    settings: PrayerSettings,
    recovery: SettingsRecovery,
    migratedAutomaticCoordinates: PrayerCoordinates? = nil
  ) {
    self.settings = settings
    self.recovery = recovery
    self.migratedAutomaticCoordinates = migratedAutomaticCoordinates
  }
}

/// Persistence wrapper for local user settings.
public final class SettingsStore {
  private let defaults: UserDefaults
  private let key = "ai.nakafa.prayer.settings"

  /// Creates a store backed by the provided defaults suite.
  public init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
  }

  /// Loads settings and reports migration or recoverable corruption explicitly.
  public func load() -> SettingsLoadResult {
    guard let data = defaults.data(forKey: key) else {
      return SettingsLoadResult(settings: PrayerSettings(), recovery: .none)
    }

    do {
      let settings = try JSONDecoder().decode(PrayerSettings.self, from: data)
      let legacy = try? JSONDecoder().decode(LegacySettingsMetadata.self, from: data)
      let migratedCoordinates =
        (legacy?.schemaVersion ?? 1) < PrayerSettings.currentSchemaVersion
          && legacy?.lastKnownCoordinates?.isValid == true
        ? legacy?.lastKnownCoordinates
        : nil

      return SettingsLoadResult(
        settings: settings,
        recovery: .none,
        migratedAutomaticCoordinates: migratedCoordinates
      )
    } catch {
      return SettingsLoadResult(settings: PrayerSettings(), recovery: .resetCorruptData)
    }
  }

  /// Saves settings locally and returns whether encoding succeeded.
  @discardableResult
  public func save(_ settings: PrayerSettings) -> Bool {
    guard let data = try? JSONEncoder().encode(settings) else {
      return false
    }

    defaults.set(data, forKey: key)
    return true
  }
}

private struct LegacySettingsMetadata: Decodable {
  var schemaVersion: Int?
  var lastKnownCoordinates: PrayerCoordinates?
}
