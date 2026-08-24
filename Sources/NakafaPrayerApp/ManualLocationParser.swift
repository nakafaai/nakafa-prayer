import Foundation
import NakafaPrayerCore

/// Parses a latitude and longitude only when both localized fields are complete.
struct ManualLocationParser: Sendable {
  func coordinateText(_ value: Double?, locale: Locale) -> String {
    guard let value, value.isFinite else {
      return ""
    }

    let formatter = formatter(locale: locale)
    formatter.minimumFractionDigits = 6
    formatter.maximumFractionDigits = 6
    return formatter.string(from: NSNumber(value: value)) ?? ""
  }

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

    let formatter = formatter(locale: locale)

    guard let value = formatter.number(from: trimmed)?.doubleValue,
      value.isFinite
    else {
      return nil
    }

    return value
  }

  private func formatter(locale: Locale) -> NumberFormatter {
    let formatter = NumberFormatter()
    formatter.locale = locale
    formatter.numberStyle = .decimal
    formatter.isLenient = false
    formatter.usesGroupingSeparator = false
    return formatter
  }
}
