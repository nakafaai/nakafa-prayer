import XCTest

@testable import NakafaPrayerApp

@MainActor
final class LaunchAtLoginControllerTests: XCTestCase {
  func testEnabledApprovalDisabledAndUnavailableStates() {
    let client = FakeLaunchAtLoginClient()
    let controller = LaunchAtLoginController(client: client)

    client.status = .notRegistered
    XCTAssertEqual(controller.currentState(), .disabled)

    client.status = .enabled
    XCTAssertEqual(controller.currentState(), .enabled)

    client.status = .requiresApproval
    XCTAssertEqual(controller.currentState(), .requiresApproval)

    client.isAvailable = false
    XCTAssertEqual(controller.currentState(), .unavailable)
  }

  func testApplyRegistersAndUnregistersThroughService() {
    let client = FakeLaunchAtLoginClient()
    let controller = LaunchAtLoginController(client: client)

    XCTAssertEqual(controller.apply(enabled: true), .enabled)
    XCTAssertEqual(client.registerCount, 1)

    XCTAssertEqual(controller.apply(enabled: false), .disabled)
    XCTAssertEqual(client.unregisterCount, 1)
  }

  func testApplySurfacesServiceErrors() {
    let client = FakeLaunchAtLoginClient()
    client.error = TestLaunchAtLoginError.failed
    let controller = LaunchAtLoginController(client: client)

    XCTAssertEqual(controller.apply(enabled: true), .failed)
  }

  func testApprovalActionUsesSupportedSystemSettingsEntryPoint() {
    let client = FakeLaunchAtLoginClient()
    let controller = LaunchAtLoginController(client: client)

    controller.openSystemSettings()

    XCTAssertEqual(client.openSettingsCount, 1)
  }
}

@MainActor
private final class FakeLaunchAtLoginClient: LaunchAtLoginClient {
  var isAvailable = true
  var status = LaunchAtLoginServiceStatus.notRegistered
  var error: Error?
  var registerCount = 0
  var unregisterCount = 0
  var openSettingsCount = 0

  func register() throws {
    registerCount += 1
    if let error {
      throw error
    }
    status = .enabled
  }

  func unregister() throws {
    unregisterCount += 1
    if let error {
      throw error
    }
    status = .notRegistered
  }

  func openSystemSettings() {
    openSettingsCount += 1
  }
}

private enum TestLaunchAtLoginError: Error {
  case failed
}
