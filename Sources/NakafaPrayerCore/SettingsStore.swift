import Foundation

/// Thin persistence wrapper for local user settings.
///
/// The app uses one encoded settings blob to keep migrations explicit and avoid
/// scattering preference keys across the codebase.
public final class SettingsStore {
  private let defaults: UserDefaults
  private let key = "ai.nakafa.prayer.settings"

  /// Creates a store backed by the provided defaults suite.
  public init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
  }

  /// Loads settings, returning defaults if nothing has been saved yet.
  public func load() -> PrayerSettings {
    guard let data = defaults.data(forKey: key) else {
      return PrayerSettings()
    }

    do {
      return try JSONDecoder().decode(PrayerSettings.self, from: data)
    } catch {
      return PrayerSettings()
    }
  }

  /// Saves settings locally. Failed encoding is ignored because settings are recoverable.
  public func save(_ settings: PrayerSettings) {
    guard let data = try? JSONEncoder().encode(settings) else {
      return
    }

    defaults.set(data, forKey: key)
  }
}
