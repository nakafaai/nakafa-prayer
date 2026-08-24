import NakafaPrayerCore
import SwiftUI

struct CalculationSettingsSection: View {
  @ObservedObject var model: AppModel

  private var localizer: Localizer {
    model.localizer
  }

  var body: some View {
    Section(localizer.text("settings.calculation")) {
      Picker(
        localizer.text("settings.calculation_method"),
        selection: Binding(
          get: { model.settings.calculationMethod },
          set: { model.setCalculationMethod($0) }
        )
      ) {
        ForEach(CalculationMethodID.allCases) { method in
          Text(localizer.text("method.\(method.rawValue)")).tag(method)
        }
      }

      Picker(
        localizer.text("settings.madhab"),
        selection: Binding(
          get: { model.settings.madhab },
          set: { model.setMadhab($0) }
        )
      ) {
        ForEach(MadhabID.allCases) { madhab in
          Text(localizer.text("madhab.\(madhab.rawValue)")).tag(madhab)
        }
      }

      Text(model.calculationText)
        .font(.callout)
        .foregroundStyle(.secondary)
    }
  }
}
