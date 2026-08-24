import SwiftUI

/// Native settings grouped by the app's user-facing domains.
struct SettingsView: View {
  @ObservedObject var model: AppModel

  var body: some View {
    Form {
      ReminderSettingsSection(model: model)
      LocationSettingsSection(model: model)
      CalculationSettingsSection(model: model)
      FocusSettingsSection(model: model)
      GeneralSettingsSection(model: model)
    }
    .formStyle(.grouped)
  }
}
