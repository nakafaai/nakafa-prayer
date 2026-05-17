import AppKit
import NakafaPrayerCore
import SwiftUI

/// App entrypoint for the menu bar utility.
@main
@MainActor
struct NakafaPrayerApp: App {
  @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate
  @StateObject private var model: AppModel

  init() {
    let model = AppModel()
    _model = StateObject(wrappedValue: model)
    AppDelegate.model = model
  }

  var body: some Scene {
    MenuBarExtra {
      MenuContent(model: model)
        .environment(\.locale, model.localizer.locale)
    } label: {
      Label(model.localizer.text("app.name"), systemImage: "moon.stars")
    }

    Settings {
      SettingsView(model: model)
        .environment(\.locale, model.localizer.locale)
        .frame(width: 460)
    }
  }
}

/// AppKit delegate for macOS activation policy and termination guard.
final class AppDelegate: NSObject, NSApplicationDelegate {
  @MainActor static weak var model: AppModel?

  func applicationDidFinishLaunching(_ notification: Notification) {
    NSApp.setActivationPolicy(.accessory)

    Task { @MainActor in
      Self.model?.start()
    }
  }

  func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
    if Self.model?.isLocked == true {
      return .terminateCancel
    }

    return .terminateNow
  }
}

/// Menu bar popover content.
struct MenuContent: View {
  @ObservedObject var model: AppModel

  var body: some View {
    Text(model.statusText)

    Divider()

    Button(model.localizer.text("app.refresh_location")) {
      model.requestLocationIfNeeded()
    }

    Button(model.localizer.text("app.test_lock")) {
      model.testLock()
    }

    SettingsLink {
      Text(model.localizer.text("app.settings"))
    }

    Divider()

    Button(model.localizer.text("app.quit")) {
      NSApp.terminate(nil)
    }
  }
}
