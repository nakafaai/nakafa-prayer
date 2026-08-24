import Foundation
import OSLog
import ServiceManagement

/// User-visible launch-at-login registration state.
enum LaunchAtLoginState: Equatable, Sendable {
  case disabled
  case enabled
  case requiresApproval
  case unavailable
  case failed
}

/// Framework-independent login-item status used by the controller and tests.
enum LaunchAtLoginServiceStatus: Equatable, Sendable {
  case notRegistered
  case enabled
  case requiresApproval
  case notFound
}

/// Minimal Service Management boundary for deterministic state tests.
@MainActor
protocol LaunchAtLoginClient: AnyObject {
  var isAvailable: Bool { get }
  var status: LaunchAtLoginServiceStatus { get }
  func register() throws
  func unregister() throws
  func openSystemSettings()
}

/// Applies the app's launch-at-login preference through macOS login items.
@MainActor
struct LaunchAtLoginController {
  private let logger = Logger(subsystem: "ai.nakafa.prayer", category: "LaunchAtLogin")
  private let client: any LaunchAtLoginClient

  init(client: (any LaunchAtLoginClient)? = nil) {
    self.client = client ?? SystemLaunchAtLoginClient()
  }

  /// Returns the current login-item state without changing it.
  func currentState() -> LaunchAtLoginState {
    guard client.isAvailable else {
      return .unavailable
    }

    return state(for: client.status)
  }

  /// Registers or unregisters the bundled app and exposes actionable failures.
  func apply(enabled: Bool) -> LaunchAtLoginState {
    guard client.isAvailable else {
      return .unavailable
    }

    do {
      if enabled {
        switch client.status {
        case .notRegistered:
          try client.register()
        case .enabled, .requiresApproval:
          break
        case .notFound:
          return .unavailable
        }
      } else {
        switch client.status {
        case .enabled, .requiresApproval:
          try client.unregister()
        case .notRegistered, .notFound:
          break
        }
      }

      return state(for: client.status)
    } catch {
      logger.error(
        "Launch-at-login update failed: \(error.localizedDescription, privacy: .public)"
      )
      return .failed
    }
  }

  /// Opens the supported Login Items settings page for approval.
  func openSystemSettings() {
    client.openSystemSettings()
  }

  private func state(for status: LaunchAtLoginServiceStatus) -> LaunchAtLoginState {
    switch status {
    case .notRegistered:
      return .disabled
    case .enabled:
      return .enabled
    case .requiresApproval:
      return .requiresApproval
    case .notFound:
      return .unavailable
    }
  }
}

@MainActor
private final class SystemLaunchAtLoginClient: LaunchAtLoginClient {
  private var service: SMAppService {
    SMAppService.mainApp
  }

  var isAvailable: Bool {
    Bundle.main.bundleURL.pathExtension == "app"
  }

  var status: LaunchAtLoginServiceStatus {
    switch service.status {
    case .notRegistered:
      return .notRegistered
    case .enabled:
      return .enabled
    case .requiresApproval:
      return .requiresApproval
    case .notFound:
      return .notFound
    @unknown default:
      return .notFound
    }
  }

  func register() throws {
    try service.register()
  }

  func unregister() throws {
    try service.unregister()
  }

  func openSystemSettings() {
    SMAppService.openSystemSettingsLoginItems()
  }
}
