import Foundation
import NakafaPrayerApp
import Sparkle

/// Bridges the direct-download build to Sparkle's standard update UI.
@MainActor
final class SparkleUpdateController: AppUpdateController {
  private lazy var updaterController = SPUStandardUpdaterController(
    startingUpdater: false,
    updaterDelegate: nil,
    userDriverDelegate: nil
  )

  var isUpdateCheckingAvailable: Bool {
    Bundle.main.object(forInfoDictionaryKey: "SUFeedURL") != nil
      && Bundle.main.object(forInfoDictionaryKey: "SUPublicEDKey") != nil
  }

  func start() {
    guard isUpdateCheckingAvailable else {
      return
    }

    updaterController.startUpdater()
  }

  func checkForUpdates() {
    guard isUpdateCheckingAvailable else {
      return
    }

    updaterController.updater.checkForUpdates()
  }
}
