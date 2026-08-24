import CoreLocation
import Foundation
import NakafaPrayerCore
import OSLog

/// User-visible state of local coordinate acquisition.
enum LocationState: Equatable, Sendable {
  case notConfigured
  case requestingPermission
  case requestingLocation
  case available(LocationSnapshot)
  case denied
  case restricted
  case failed
  case invalidManualInput
}

/// One-shot Core Location bridge that never geocodes or transmits coordinates.
@MainActor
final class LocationService: NSObject, CLLocationManagerDelegate {
  var onStateChange: ((LocationState) -> Void)?

  private let logger = Logger(subsystem: "ai.nakafa.prayer", category: "Location")
  private let manager = CLLocationManager()
  private let policy = LocationAuthorizationPolicy()

  override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyKilometer
  }

  /// Requests permission or a one-shot location after explicit user action.
  func requestAutomaticLocation() {
    performAuthorizationAction(
      policy.action(for: manager.authorizationStatus, userInitiated: true)
    )
  }

  /// Refreshes an already-authorized automatic location without prompting.
  func refreshIfAuthorized() {
    performAuthorizationAction(
      policy.action(for: manager.authorizationStatus, userInitiated: false)
    )
  }

  private func performAuthorizationAction(_ action: LocationAuthorizationAction) {
    switch action {
    case .none:
      return
    case .requestPermission:
      onStateChange?(.requestingPermission)
      manager.requestWhenInUseAuthorization()
    case .requestLocation:
      requestCurrentLocation()
    case .reportDenied:
      onStateChange?(.denied)
    case .reportRestricted:
      onStateChange?(.restricted)
    case .reportFailure:
      onStateChange?(.failed)
    }
  }

  private func requestCurrentLocation() {
    onStateChange?(.requestingLocation)
    manager.requestLocation()
  }

  nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    let status = manager.authorizationStatus

    Task { @MainActor in
      self.performAuthorizationAction(
        self.policy.action(for: status, userInitiated: false)
      )
    }
  }

  nonisolated func locationManager(
    _ manager: CLLocationManager,
    didUpdateLocations locations: [CLLocation]
  ) {
    guard let coordinate = locations.last?.coordinate else {
      return
    }

    let snapshot = LocationSnapshot(
      coordinates: PrayerCoordinates(
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      ),
      capturedAt: Date()
    )

    Task { @MainActor in
      self.onStateChange?(.available(snapshot))
    }
  }

  nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    Task { @MainActor in
      self.logger.error("Core Location failed: \(error.localizedDescription, privacy: .public)")
      self.onStateChange?(.failed)
    }
  }
}
