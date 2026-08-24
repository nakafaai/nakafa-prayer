import CoreLocation
import Foundation

/// Side effect allowed for one Core Location authorization state.
enum LocationAuthorizationAction: Equatable, Sendable {
  case none
  case requestPermission
  case requestLocation
  case reportDenied
  case reportRestricted
  case reportFailure
}

/// Keeps permission prompts limited to explicit user actions.
struct LocationAuthorizationPolicy: Sendable {
  func action(
    for status: CLAuthorizationStatus,
    userInitiated: Bool
  ) -> LocationAuthorizationAction {
    switch status {
    case .notDetermined:
      return userInitiated ? .requestPermission : .none
    case .authorized, .authorizedAlways:
      return .requestLocation
    case .denied:
      return .reportDenied
    case .restricted:
      return .reportRestricted
    @unknown default:
      return .reportFailure
    }
  }
}
