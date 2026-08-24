import NakafaPrayerCore
import SwiftUI

struct FocusSettingsSection: View {
  @ObservedObject var model: AppModel
  @State private var showsConsent = false

  private var localizer: Localizer {
    model.localizer
  }

  private var durationOptions: [Int] {
    let options = [5, 10, 15, 20, 30, 45, 60]
    let current = model.settings.focusDurationMinutes

    guard (1...60).contains(current), options.contains(current) == false else {
      return options
    }

    return (options + [current]).sorted()
  }

  var body: some View {
    Section(localizer.text("settings.focus_mode")) {
      Toggle(
        localizer.text("focus.enable"),
        isOn: Binding(
          get: { model.settings.isFocusModeEnabled },
          set: { enabled in
            if enabled {
              showsConsent = true
            } else {
              model.disableFocusMode()
            }
          }
        )
      )

      Text(localizer.text("focus.help"))
        .font(.callout)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      Picker(
        localizer.text("settings.focus_duration"),
        selection: Binding(
          get: { model.settings.focusDurationMinutes },
          set: { model.setFocusDuration($0) }
        )
      ) {
        ForEach(durationOptions, id: \.self) { minutes in
          Text(localizer.text("settings.minutes", minutes)).tag(minutes)
        }
      }
      .pickerStyle(.menu)

      Button {
        model.previewFocusMode()
      } label: {
        Label(localizer.text("focus.preview"), systemImage: "rectangle.inset.filled")
      }
      .disabled(model.isFocusModeActive)
    }
    .alert(localizer.text("focus.consent_title"), isPresented: $showsConsent) {
      Button(localizer.text("focus.enable")) {
        model.enableFocusMode()
      }
      Button(localizer.text("focus.cancel"), role: .cancel) {}
    } message: {
      Text(
        localizer.text(
          "focus.consent_message",
          model.settings.focusDurationMinutes
        )
      )
    }
  }
}
