import NakafaPrayerApp
import SwiftUI

/// Mac App Store entrypoint without Sparkle or any external updater.
@main
@MainActor
struct NakafaPrayerAppStoreApp: App {
  @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate
  @StateObject private var model: AppModel

  init() {
    let model = AppModel()

    _model = StateObject(wrappedValue: model)

    AppDelegate.model = model
  }

  var body: some Scene {
    NakafaPrayerScenes(model: model)
  }
}
