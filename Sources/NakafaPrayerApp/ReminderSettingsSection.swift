import NakafaPrayerCore
import SwiftUI

struct ReminderSettingsSection: View {
  @ObservedObject var model: AppModel

  private var localizer: Localizer {
    model.localizer
  }

  var body: some View {
    Section(localizer.text("settings.reminder")) {
      Label(model.notificationStatusText, systemImage: model.notificationStatusSymbol)

      Text(localizer.text("settings.reminder_help"))
        .font(.callout)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      notificationAction

      Toggle(
        localizer.text("settings.adhan"),
        isOn: Binding(
          get: { model.settings.adhanEnabled },
          set: { model.setAdhanEnabled($0) }
        )
      )

      Button {
        model.toggleAdhanPreview()
      } label: {
        Label(
          localizer.text(
            model.audioPreviewState == .playing
              ? "settings.stop_adhan_preview"
              : "settings.preview_adhan"
          ),
          systemImage: model.audioPreviewState == .playing ? "stop.fill" : "speaker.wave.2.fill"
        )
      }
      .disabled(model.settings.adhanEnabled == false)

      if model.audioPreviewState == .unavailable || model.audioPreviewState == .failed {
        Label(
          localizer.text("state.audio_unavailable"),
          systemImage: "exclamationmark.triangle"
        )
        .foregroundStyle(.red)
      }
    }
  }

  @ViewBuilder
  private var notificationAction: some View {
    switch model.notificationState {
    case .notDetermined:
      Button(localizer.text("action.enable_notifications")) {
        model.requestNotificationPermission()
      }
      .buttonStyle(.borderedProminent)
    case .denied, .alertsDisabled, .soundDisabled:
      Button(localizer.text("action.open_notification_settings")) {
        model.showNotificationSettings()
      }
    case .authorizationFailed:
      Button(localizer.text("action.enable_notifications")) {
        model.requestNotificationPermission()
      }
    case .schedulingFailed:
      Button(localizer.text("action.retry_scheduling")) {
        model.reconcileSchedule()
      }
    case .authorized:
      EmptyView()
    }
  }
}
