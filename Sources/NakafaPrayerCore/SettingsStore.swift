import Foundation

public final class SettingsStore {
    private let defaults: UserDefaults
    private let key = "ai.nakafa.prayer.settings"

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

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

    public func save(_ settings: PrayerSettings) {
        guard let data = try? JSONEncoder().encode(settings) else {
            return
        }

        defaults.set(data, forKey: key)
    }
}
