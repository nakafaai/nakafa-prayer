import NakafaPrayerCore
import SwiftUI

struct GeneralSettingsSection: View {
  @ObservedObject var model: AppModel

  private var localizer: Localizer {
    model.localizer
  }

  var body: some View {
    Section(localizer.text("settings.general")) {
      Picker(
        localizer.text("settings.language"),
        selection: Binding(
          get: { model.settings.language },
          set: { model.setLanguage($0) }
        )
      ) {
        ForEach(AppLanguage.allCases) { language in
          Text(localizer.text("language.\(language.rawValue)")).tag(language)
        }
      }

      Toggle(
        localizer.text("settings.launch_at_login"),
        isOn: Binding(
          get: { model.settings.launchAtLogin },
          set: { model.setLaunchAtLogin($0) }
        )
      )

      launchAtLoginMessage

      if model.settingsRecovery == .resetCorruptData {
        Label(
          localizer.text("state.settings_recovered"),
          systemImage: "exclamationmark.triangle"
        )
        .foregroundStyle(.orange)
      }

      if model.settingsSaveFailed {
        Label(
          localizer.text("state.settings_save_failed"),
          systemImage: "exclamationmark.triangle"
        )
        .foregroundStyle(.red)
      }
    }
  }

  @ViewBuilder
  private var launchAtLoginMessage: some View {
    switch model.launchAtLoginState {
    case .requiresApproval:
      Label(
        localizer.text("state.login_item_requires_approval"),
        systemImage: "exclamationmark.triangle"
      )
      Button(localizer.text("action.open_login_items")) {
        model.showLoginItemsSettings()
      }
    case .unavailable:
      Text(localizer.text("state.login_item_unavailable"))
        .foregroundStyle(.secondary)
    case .failed:
      Label(
        localizer.text("state.login_item_failed"),
        systemImage: "exclamationmark.triangle"
      )
      .foregroundStyle(.red)
    case .disabled, .enabled:
      EmptyView()
    }
  }
}
