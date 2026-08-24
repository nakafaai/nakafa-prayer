import Foundation
import NakafaPrayerCore
import UserNotifications
import XCTest

@testable import NakafaPrayerApp

@MainActor
final class LocalNotificationSchedulerTests: XCTestCase {
  func testPermissionStatesRemainExplicit() async {
    let client = FakeNotificationCenterClient()
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)

    client.systemSettings = NotificationSystemSettings(
      authorization: .notDetermined,
      alertsEnabled: false,
      soundEnabled: false
    )
    var state = await scheduler.currentPermissionState()
    XCTAssertEqual(state, .notDetermined)

    client.systemSettings = NotificationSystemSettings(
      authorization: .denied,
      alertsEnabled: false,
      soundEnabled: false
    )
    state = await scheduler.currentPermissionState()
    XCTAssertEqual(state, .denied)

    client.systemSettings = NotificationSystemSettings(
      authorization: .authorized,
      alertsEnabled: false,
      soundEnabled: true
    )
    state = await scheduler.currentPermissionState()
    XCTAssertEqual(state, .alertsDisabled)

    client.systemSettings = NotificationSystemSettings(
      authorization: .authorized,
      alertsEnabled: true,
      soundEnabled: false
    )
    state = await scheduler.currentPermissionState()
    XCTAssertEqual(state, .soundDisabled)
  }

  func testPermissionRequestOccursOnlyThroughExplicitMethod() async {
    let client = FakeNotificationCenterClient()
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)

    _ = await scheduler.currentPermissionState()
    XCTAssertEqual(client.authorizationRequestCount, 0)

    client.settingsAfterPermissionRequest = NotificationSystemSettings(
      authorization: .authorized,
      alertsEnabled: true,
      soundEnabled: true
    )
    let state = await scheduler.requestPermission()
    XCTAssertEqual(state, .authorized)
    XCTAssertEqual(client.authorizationRequestCount, 1)
  }

  func testPermissionRequestFailureIsVisible() async {
    let client = FakeNotificationCenterClient()
    client.authorizationError = TestError.failed
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)

    let state = await scheduler.requestPermission()

    XCTAssertEqual(state, .authorizationFailed)
    XCTAssertEqual(client.authorizationRequestCount, 1)
  }

  func testReconciliationAddsDesiredRequestsBeforeRemovingOwnedStaleRequests() async {
    let client = FakeNotificationCenterClient()
    client.systemSettings = .authorized
    client.pendingIdentifiers = [
      "ai.nakafa.prayer.v1.2026-08-24.fajr",
      "ai.nakafa.prayer.v1.2026-08-23.isha",
      "another.app.request",
    ]
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)
    let occurrence = PrayerOccurrence(
      id: PrayerOccurrenceID(rawValue: "2026-08-24.fajr"),
      prayer: .fajr,
      date: Date(timeIntervalSince1970: 1_777_000_000)
    )

    let state = await scheduler.reconcile(
      occurrences: [occurrence],
      localizer: Localizer(language: .english),
      adhanEnabled: false
    )

    XCTAssertEqual(state, .authorized)
    XCTAssertEqual(
      client.events,
      [
        .added("ai.nakafa.prayer.v1.2026-08-24.fajr"),
        .removed(["ai.nakafa.prayer.v1.2026-08-23.isha"]),
      ]
    )
  }

  func testDeniedPermissionRemovesOnlyOwnedRequests() async {
    let client = FakeNotificationCenterClient()
    client.systemSettings = NotificationSystemSettings(
      authorization: .denied,
      alertsEnabled: false,
      soundEnabled: false
    )
    client.pendingIdentifiers = [
      "ai.nakafa.prayer.v1.2026-08-24.fajr",
      "another.app.request",
    ]
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)

    let state = await scheduler.reconcile(
      occurrences: [],
      localizer: Localizer(language: .english),
      adhanEnabled: false
    )

    XCTAssertEqual(state, .denied)
    XCTAssertEqual(
      client.events,
      [.removed(["ai.nakafa.prayer.v1.2026-08-24.fajr"])]
    )
  }

  func testCancelledReconciliationDoesNotRemoveOwnedRequests() async {
    let client = FakeNotificationCenterClient()
    client.systemSettings = NotificationSystemSettings(
      authorization: .denied,
      alertsEnabled: false,
      soundEnabled: false
    )
    client.pendingIdentifiers = ["ai.nakafa.prayer.v1.2026-08-24.fajr"]
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)

    let task = Task { @MainActor in
      await scheduler.reconcile(
        occurrences: [],
        localizer: Localizer(language: .english),
        adhanEnabled: false
      )
    }
    task.cancel()
    _ = await task.value

    XCTAssertTrue(client.events.isEmpty)
  }

  func testSchedulingFailureIsVisibleAndDoesNotRemoveStaleRequests() async {
    let client = FakeNotificationCenterClient()
    client.systemSettings = .authorized
    client.addError = TestError.failed
    client.pendingIdentifiers = ["ai.nakafa.prayer.v1.2026-08-23.isha"]
    let scheduler = LocalNotificationScheduler(client: client, calendar: .gregorianUTC)
    let occurrence = PrayerOccurrence(
      id: PrayerOccurrenceID(rawValue: "2026-08-24.fajr"),
      prayer: .fajr,
      date: Date(timeIntervalSince1970: 1_777_000_000)
    )

    let state = await scheduler.reconcile(
      occurrences: [occurrence],
      localizer: Localizer(language: .english),
      adhanEnabled: false
    )

    XCTAssertEqual(state, .schedulingFailed)
    XCTAssertTrue(client.events.isEmpty)
  }

}

@MainActor
private final class FakeNotificationCenterClient: NotificationCenterClient {
  enum Event: Equatable {
    case added(String)
    case removed([String])
  }

  var systemSettings = NotificationSystemSettings(
    authorization: .notDetermined,
    alertsEnabled: false,
    soundEnabled: false
  )
  var settingsAfterPermissionRequest: NotificationSystemSettings?
  var authorizationError: Error?
  var pendingIdentifiers: [String] = []
  var addError: Error?
  var authorizationRequestCount = 0
  var events: [Event] = []

  func settings() async -> NotificationSystemSettings {
    systemSettings
  }

  func requestAuthorization() async throws {
    authorizationRequestCount += 1
    if let authorizationError {
      throw authorizationError
    }
    if let settingsAfterPermissionRequest {
      systemSettings = settingsAfterPermissionRequest
    }
  }

  func pendingRequestIdentifiers() async -> [String] {
    pendingIdentifiers
  }

  func add(_ request: UNNotificationRequest) async throws {
    if let addError {
      throw addError
    }

    events.append(.added(request.identifier))
  }

  func removePendingRequests(withIdentifiers identifiers: [String]) {
    events.append(.removed(identifiers.sorted()))
  }
}

extension NotificationSystemSettings {
  fileprivate static var authorized: Self {
    NotificationSystemSettings(
      authorization: .authorized,
      alertsEnabled: true,
      soundEnabled: true
    )
  }
}

private enum TestError: Error {
  case failed
}
