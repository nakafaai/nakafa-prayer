import Foundation
import NakafaPrayerCore

/// Last automatic location stored locally outside user preferences.
struct LocationSnapshot: Codable, Equatable, Sendable {
  var coordinates: PrayerCoordinates
  var capturedAt: Date
}

/// Local cache for the most recent automatic Core Location result.
final class LocationCache {
  private let defaults: UserDefaults
  private let key = "ai.nakafa.prayer.location-cache"

  init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
  }

  func load() -> LocationSnapshot? {
    guard let data = defaults.data(forKey: key),
      let snapshot = try? JSONDecoder().decode(LocationSnapshot.self, from: data),
      snapshot.coordinates.isValid
    else {
      return nil
    }

    return snapshot
  }

  @discardableResult
  func save(_ snapshot: LocationSnapshot) -> Bool {
    guard snapshot.coordinates.isValid,
      let data = try? JSONEncoder().encode(snapshot)
    else {
      return false
    }

    defaults.set(data, forKey: key)
    return true
  }
}
