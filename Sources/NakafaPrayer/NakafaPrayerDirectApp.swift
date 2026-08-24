import NakafaPrayerApp
import SwiftUI

/// Developer ID app entrypoint with Sparkle updates enabled when configured.
@main
@MainActor
struct NakafaPrayerDirectApp: App {
  @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate
  @StateObject private var model: AppModel
  private let updateController: SparkleUpdateController

  init() {
    let model = AppModel()
    let updateController = SparkleUpdateController()

    _model = StateObject(wrappedValue: model)
    self.updateController = updateController

    AppDelegate.model = model
    AppDelegate.updateController = updateController
  }

  var body: some Scene {
    NakafaPrayerScenes(model: model, updateController: updateController)
  }
}
