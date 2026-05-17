import Foundation

/// Locale-aware time and countdown formatting used by menu and lock UI.
public struct TimeFormatting: Sendable {
  private let locale: Locale
  private let timeZone: TimeZone

  /// Creates a formatter for the given locale and timezone.
  public init(locale: Locale, timeZone: TimeZone = .current) {
    self.locale = locale
    self.timeZone = timeZone
  }

  /// Formats a prayer time using the user's current 12/24-hour preference.
  public func time(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.locale = locale
    formatter.timeZone = timeZone
    formatter.dateStyle = .none
    formatter.timeStyle = .short
    return formatter.string(from: date)
  }

  /// Formats a remaining duration as `mm:ss`.
  public func countdown(_ interval: TimeInterval) -> String {
    let remaining = max(Int(interval.rounded(.up)), 0)
    let minutes = remaining / 60
    let seconds = remaining % 60
    return "\(padded(minutes)):\(padded(seconds))"
  }

  private func padded(_ value: Int) -> String {
    let formatter = NumberFormatter()
    formatter.locale = locale
    formatter.minimumIntegerDigits = 2
    formatter.maximumFractionDigits = 0
    return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
  }
}
