import Foundation
import NakafaPrayerCore
import OSLog
import UserNotifications

/// User-visible notification authorization and scheduling state.
enum NotificationPermissionState: Equatable, Sendable {
  case notDetermined
  case authorized
  case denied
  case alertsDisabled
  case soundDisabled
  case authorizationFailed
  case schedulingFailed

  var canScheduleAlerts: Bool {
    self == .authorized || self == .soundDisabled
  }
}

/// Framework-independent notification settings used by the scheduler and tests.
struct NotificationSystemSettings: Equatable, Sendable {
  enum Authorization: Equatable, Sendable {
    case notDetermined
    case denied
    case authorized
  }

  var authorization: Authorization
  var alertsEnabled: Bool
  var soundEnabled: Bool
}

/// Minimal local-notification center boundary for deterministic service tests.
@MainActor
protocol NotificationCenterClient: AnyObject {
  func settings() async -> NotificationSystemSettings
  func requestAuthorization() async throws
  func pendingRequestIdentifiers() async -> [String]
  func add(_ request: UNNotificationRequest) async throws
  func removePendingRequests(withIdentifiers identifiers: [String])
}

/// Pure identifier diff used to reconcile app-owned notification requests.
struct NotificationReconciliation: Equatable, Sendable {
  var desiredIdentifiers: Set<String>
  var staleIdentifiers: Set<String>

  static func make(desired: Set<String>, pending: Set<String>) -> Self {
    Self(
      desiredIdentifiers: desired,
      staleIdentifiers: pending.subtracting(desired)
    )
  }
}

/// Schedules a rolling set of local prayer notifications without prompting implicitly.
@MainActor
final class LocalNotificationScheduler {
  static let identifierPrefix = "ai.nakafa.prayer.v1."

  private let calendar: Calendar
  private let client: any NotificationCenterClient
  private let logger = Logger(subsystem: "ai.nakafa.prayer", category: "Notifications")

  init(
    client: (any NotificationCenterClient)? = nil,
    calendar: Calendar = .autoupdatingCurrent
  ) {
    self.client = client ?? SystemNotificationCenterClient()
    self.calendar = calendar
  }

  /// Reads current system settings without requesting authorization.
  func currentPermissionState() async -> NotificationPermissionState {
    permissionState(from: await client.settings())
  }

  /// Requests alert and sound permission after an explicit user action.
  func requestPermission() async -> NotificationPermissionState {
    do {
      try await client.requestAuthorization()
      return await currentPermissionState()
    } catch {
      logger.error(
        "Notification authorization failed: \(error.localizedDescription, privacy: .public)")
      return .authorizationFailed
    }
  }

  /// Replaces the app-owned seven-day notification plan and removes stale requests.
  func reconcile(
    occurrences: [PrayerOccurrence],
    localizer: Localizer,
    adhanEnabled: Bool
  ) async -> NotificationPermissionState {
    let state = await currentPermissionState()
    guard Task.isCancelled == false else {
      return state
    }

    guard state.canScheduleAlerts else {
      await removeAllOwnedRequests()
      return state
    }

    let desiredRequests = occurrences.map {
      request(
        for: $0,
        localizer: localizer,
        playSound: adhanEnabled && state != .soundDisabled
      )
    }
    let pendingIdentifiers = await client.pendingRequestIdentifiers()
    let pendingOwnedIdentifiers = Set(
      pendingIdentifiers.filter { $0.hasPrefix(Self.identifierPrefix) }
    )
    let desiredIdentifiers = Set(desiredRequests.map(\.identifier))
    let reconciliation = NotificationReconciliation.make(
      desired: desiredIdentifiers,
      pending: pendingOwnedIdentifiers
    )

    do {
      for request in desiredRequests {
        try Task.checkCancellation()
        try await client.add(request)
      }

      try Task.checkCancellation()
      client.removePendingRequests(
        withIdentifiers: Array(reconciliation.staleIdentifiers)
      )
      return state
    } catch is CancellationError {
      return state
    } catch {
      logger.error(
        "Notification scheduling failed: \(error.localizedDescription, privacy: .public)")
      return .schedulingFailed
    }
  }

  /// Removes only requests owned by Nakafa Prayer.
  func removeAllOwnedRequests() async {
    guard Task.isCancelled == false else {
      return
    }

    let pendingIdentifiers = await client.pendingRequestIdentifiers()
    guard Task.isCancelled == false else {
      return
    }

    let identifiers = pendingIdentifiers.filter {
      $0.hasPrefix(Self.identifierPrefix)
    }
    client.removePendingRequests(withIdentifiers: identifiers)
  }

  private func request(
    for occurrence: PrayerOccurrence,
    localizer: Localizer,
    playSound: Bool
  ) -> UNNotificationRequest {
    let content = UNMutableNotificationContent()
    content.title = localizer.text(
      "notification.title",
      localizer.prayerName(occurrence.prayer)
    )
    content.body = localizer.text("notification.body")
    content.threadIdentifier = "ai.nakafa.prayer.reminders"
    content.userInfo = [
      "prayer": occurrence.prayer.rawValue,
      "occurrence": occurrence.id.rawValue,
    ]

    if playSound {
      content.sound =
        AdhanAudioResource.isAvailable
        ? UNNotificationSound(named: UNNotificationSoundName(AdhanAudioResource.fileName))
        : .default
    }

    var components = calendar.dateComponents(
      [.year, .month, .day, .hour, .minute, .second],
      from: occurrence.date
    )
    components.timeZone = calendar.timeZone
    let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

    return UNNotificationRequest(
      identifier: Self.identifierPrefix + occurrence.id.rawValue,
      content: content,
      trigger: trigger
    )
  }

  private func permissionState(from settings: NotificationSystemSettings)
    -> NotificationPermissionState
  {
    switch settings.authorization {
    case .notDetermined:
      return .notDetermined
    case .denied:
      return .denied
    case .authorized:
      if settings.alertsEnabled == false {
        return .alertsDisabled
      }

      if settings.soundEnabled == false {
        return .soundDisabled
      }

      return .authorized
    }
  }
}

@MainActor
private final class SystemNotificationCenterClient: NotificationCenterClient {
  private let center: UNUserNotificationCenter
  private let presentationDelegate = NotificationPresentationDelegate()

  init(center: UNUserNotificationCenter = .current()) {
    self.center = center
    center.delegate = presentationDelegate
  }

  func settings() async -> NotificationSystemSettings {
    await withCheckedContinuation { continuation in
      center.getNotificationSettings { settings in
        let authorization: NotificationSystemSettings.Authorization

        switch settings.authorizationStatus {
        case .notDetermined:
          authorization = .notDetermined
        case .denied:
          authorization = .denied
        case .authorized, .provisional, .ephemeral:
          authorization = .authorized
        @unknown default:
          authorization = .denied
        }

        continuation.resume(
          returning: NotificationSystemSettings(
            authorization: authorization,
            alertsEnabled: settings.alertSetting != .disabled,
            soundEnabled: settings.soundSetting != .disabled
          )
        )
      }
    }
  }

  func requestAuthorization() async throws {
    _ = try await center.requestAuthorization(options: [.alert, .sound])
  }

  func pendingRequestIdentifiers() async -> [String] {
    await withCheckedContinuation { continuation in
      center.getPendingNotificationRequests { requests in
        continuation.resume(returning: requests.map(\.identifier))
      }
    }
  }

  func add(_ request: UNNotificationRequest) async throws {
    try await center.add(request)
  }

  func removePendingRequests(withIdentifiers identifiers: [String]) {
    center.removePendingNotificationRequests(withIdentifiers: identifiers)
  }
}

private final class NotificationPresentationDelegate: NSObject, UNUserNotificationCenterDelegate {
  nonisolated func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification
  ) async -> UNNotificationPresentationOptions {
    [.banner, .list, .sound]
  }
}
