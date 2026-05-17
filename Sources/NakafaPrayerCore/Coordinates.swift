import Foundation

/// Latitude and longitude used for local prayer-time calculation.
public struct PrayerCoordinates: Codable, Equatable, Sendable {
  /// Latitude in decimal degrees.
  public var latitude: Double

  /// Longitude in decimal degrees.
  public var longitude: Double

  /// Creates a coordinate pair in decimal degrees.
  public init(latitude: Double, longitude: Double) {
    self.latitude = latitude
    self.longitude = longitude
  }

  /// True when the coordinates are inside valid WGS84 latitude/longitude bounds.
  public var isValid: Bool {
    (-90...90).contains(latitude) && (-180...180).contains(longitude)
  }
}
