import Foundation

/// Safety policy for automatic Focus Mode activation after timer delays or wakeup.
struct FocusActivationPolicy: Equatable, Sendable {
  static let defaultMaximumLateness: TimeInterval = 5 * 60

  var maximumLateness: TimeInterval = Self.defaultMaximumLateness

  func shouldStart(scheduledAt: Date, now: Date) -> Bool {
    let lateness = now.timeIntervalSince(scheduledAt)
    return lateness >= 0 && lateness <= maximumLateness
  }
}
