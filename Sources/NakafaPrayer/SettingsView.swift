import NakafaPrayerCore
import SwiftUI

/// Settings window for calculation, language, location, lock, and startup options.
struct SettingsView: View {
  @ObservedObject var model: AppModel

  private var localizer: Localizer {
    model.localizer
  }

  var body: some View {
    Form {
      Picker(localizer.text("settings.language"), selection: $model.settings.language) {
        ForEach(AppLanguage.allCases) { language in
          Text(localizer.text("language.\(language.rawValue)")).tag(language)
        }
      }

      Section(localizer.text("settings.calculation")) {
        Picker(localizer.text("settings.calculation"), selection: $model.settings.calculationMethod)
        {
          ForEach(CalculationMethodID.allCases) { method in
            Text(localizer.text("method.\(method.rawValue)")).tag(method)
          }
        }

        Picker(localizer.text("settings.madhab"), selection: $model.settings.madhab) {
          ForEach(MadhabID.allCases) { madhab in
            Text(localizer.text("madhab.\(madhab.rawValue)")).tag(madhab)
          }
        }
      }

      Section(localizer.text("settings.location")) {
        Toggle(
          localizer.text("settings.manual_coordinates"), isOn: $model.settings.useManualCoordinates)

        TextField(
          localizer.text("settings.latitude"),
          value: $model.settings.manualCoordinates.latitude,
          format: .number.precision(.fractionLength(6))
        )
        .disabled(model.settings.useManualCoordinates == false)

        TextField(
          localizer.text("settings.longitude"),
          value: $model.settings.manualCoordinates.longitude,
          format: .number.precision(.fractionLength(6))
        )
        .disabled(model.settings.useManualCoordinates == false)

        Button(localizer.text("app.refresh_location")) {
          model.requestLocationIfNeeded()
        }
        .disabled(model.settings.useManualCoordinates)
      }

      Section(localizer.text("settings.lock_duration")) {
        Stepper(
          value: $model.settings.lockDurationMinutes,
          in: 1...60
        ) {
          Text(localizer.text("settings.minutes", model.settings.lockDurationMinutes))
        }
      }

      Section {
        Toggle(localizer.text("settings.adhan"), isOn: $model.settings.adhanEnabled)
        Toggle(localizer.text("settings.tts"), isOn: $model.settings.ttsEnabled)
        Toggle(localizer.text("settings.launch_at_login"), isOn: $model.settings.launchAtLogin)
      }
    }
    .formStyle(.grouped)
    .padding()
    .onChange(of: model.settings) {
      model.saveSettings()
    }
  }
}
