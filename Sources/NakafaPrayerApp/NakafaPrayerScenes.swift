import AppKit
import NakafaPrayerCore
import SwiftUI

/// Provides manual update checks for release channels that support them.
@MainActor
public protocol AppUpdateController: AnyObject {
  /// Whether this release channel can check for app updates itself.
  var isUpdateCheckingAvailable: Bool { get }

  /// Starts any update service after the app has finished launching.
  func start()

  /// Opens the channel's native update check UI.
  func checkForUpdates()
}

/// Shared menu bar and settings scenes for every release channel.
public struct NakafaPrayerScenes: Scene {
  @ObservedObject private var model: AppModel
  private let updateController: (any AppUpdateController)?

  /// Creates the app scenes with channel-specific update behavior.
  public init(
    model: AppModel,
    updateController: (any AppUpdateController)? = nil
  ) {
    self.model = model
    self.updateController = updateController
  }

  public var body: some Scene {
    MenuBarExtra {
      MenuContent(model: model, updateController: updateController)
        .environment(\.locale, model.localizer.locale)
    } label: {
      Label(model.localizer.text("app.name"), systemImage: "moon.stars")
        .labelStyle(.iconOnly)
        .accessibilityLabel(model.localizer.text("app.name"))
    }

    Settings {
      SettingsView(model: model)
        .environment(\.locale, model.localizer.locale)
        .frame(minWidth: 500, idealWidth: 540, minHeight: 580)
    }

  }
}

/// AppKit delegate for macOS activation policy and termination guard.
@MainActor
public final class AppDelegate: NSObject, NSApplicationDelegate {
  public static weak var model: AppModel?
  public static weak var updateController: (any AppUpdateController)?

  public func applicationDidFinishLaunching(_ notification: Notification) {
    NSApp.setActivationPolicy(.accessory)

    Task { @MainActor in
      Self.model?.start()
      Self.updateController?.start()
    }
  }

  public func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
    Self.model?.prepareForTermination()
    return .terminateNow
  }

  public func applicationWillTerminate(_ notification: Notification) {
    Self.model?.prepareForTermination()
  }
}

/// Menu bar popover content.
struct MenuContent: View {
  @ObservedObject var model: AppModel
  let updateController: (any AppUpdateController)?

  var body: some View {
    let prayerTimes = model.menuPrayerTimes

    Label(model.statusText, systemImage: model.statusSymbol)
      .accessibilityLabel(model.statusText)

    Label(model.locationText, systemImage: "location")
      .foregroundStyle(.secondary)

    Label(model.notificationStatusText, systemImage: model.notificationStatusSymbol)
      .foregroundStyle(.secondary)

    if prayerTimes.isEmpty == false {
      Divider()

      Label(model.menuPrayerTimesTitle, systemImage: "calendar")

      ForEach(prayerTimes) { prayerTime in
        if model.isNextPrayerTime(prayerTime) {
          Label(
            model.prayerTimeMenuText(for: prayerTime),
            systemImage: "arrow.right.circle.fill"
          )
          .accessibilityLabel(model.prayerTimeAccessibilityLabel(for: prayerTime))
        } else {
          Text(model.prayerTimeMenuText(for: prayerTime))
            .accessibilityLabel(model.prayerTimeAccessibilityLabel(for: prayerTime))
        }
      }
    }

    Divider()

    if model.settings.locationMode == .automatic {
      switch model.locationState {
      case .denied, .restricted:
        Button {
          model.showLocationSettings()
        } label: {
          Label(model.localizer.text("action.open_location_settings"), systemImage: "gear")
        }
      default:
        Button {
          model.requestAutomaticLocation()
        } label: {
          Label(model.localizer.text("app.refresh_location"), systemImage: "location")
        }
      }
    }

    switch model.notificationState {
    case .notDetermined:
      Button {
        model.requestNotificationPermission()
      } label: {
        Label(model.localizer.text("action.enable_notifications"), systemImage: "bell")
      }
    case .denied, .alertsDisabled:
      Button {
        model.showNotificationSettings()
      } label: {
        Label(model.localizer.text("action.open_notification_settings"), systemImage: "gear")
      }
    case .authorizationFailed:
      Button {
        model.requestNotificationPermission()
      } label: {
        Label(model.localizer.text("action.enable_notifications"), systemImage: "bell")
      }
    case .authorized, .soundDisabled, .schedulingFailed:
      EmptyView()
    }

    SettingsLink {
      Label(model.localizer.text("app.settings"), systemImage: "gearshape")
    }

    if updateController?.isUpdateCheckingAvailable == true {
      Button {
        updateController?.checkForUpdates()
      } label: {
        Label(
          model.localizer.text("app.check_for_updates"), systemImage: "arrow.triangle.2.circlepath")
      }
    }

    Divider()

    Button {
      NSApp.terminate(nil)
    } label: {
      Label(model.localizer.text("app.quit"), systemImage: "power")
    }
  }
}
