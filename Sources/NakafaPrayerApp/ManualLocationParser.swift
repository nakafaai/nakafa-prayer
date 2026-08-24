import Foundation
import NakafaPrayerCore

/// Parses a latitude and longitude only when both localized fields are complete.
struct ManualLocationParser: Sendable {
  func coordinates(
    latitude: String,
    longitude: String,
    locale: Locale
  ) -> PrayerCoordinates? {
    guard let latitudeValue = number(from: latitude, locale: locale),
      let longitudeValue = number(from: longitude, locale: locale)
    else {
      return nil
    }

    let coordinates = PrayerCoordinates(
      latitude: latitudeValue,
      longitude: longitudeValue
    )
    return coordinates.isValid ? coordinates : nil
  }

  private func number(from text: String, locale: Locale) -> Double? {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard trimmed.isEmpty == false else {
      return nil
    }

    let formatter = NumberFormatter()
    formatter.locale = locale
    formatter.numberStyle = .decimal
    formatter.isLenient = false

    guard let value = formatter.number(from: trimmed)?.doubleValue,
      value.isFinite
    else {
      return nil
    }

    return value
  }
}
