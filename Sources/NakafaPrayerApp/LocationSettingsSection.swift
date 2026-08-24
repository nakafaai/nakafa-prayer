import NakafaPrayerCore
import SwiftUI

struct LocationSettingsSection: View {
  @ObservedObject var model: AppModel

  @State private var latitudeText: String
  @State private var longitudeText: String
  @State private var manualLabel: String

  init(model: AppModel) {
    let formatter = ManualLocationParser()
    let locale = model.localizer.locale

    self.model = model
    _latitudeText = State(
      initialValue: formatter.coordinateText(
        model.settings.manualCoordinates?.latitude,
        locale: locale
      )
    )
    _longitudeText = State(
      initialValue: formatter.coordinateText(
        model.settings.manualCoordinates?.longitude,
        locale: locale
      )
    )
    _manualLabel = State(initialValue: model.settings.manualLocationLabel ?? "")
  }

  private var localizer: Localizer {
    model.localizer
  }

  var body: some View {
    Section(localizer.text("settings.location")) {
      Picker(
        localizer.text("settings.location_mode"),
        selection: Binding(
          get: { model.settings.locationMode },
          set: { model.setLocationMode($0) }
        )
      ) {
        Text(localizer.text("location.automatic")).tag(LocationMode.automatic)
        Text(localizer.text("location.manual")).tag(LocationMode.manual)
      }
      .pickerStyle(.segmented)

      Label(model.locationStatusText, systemImage: statusSymbol)

      if model.locationCacheSaveFailed {
        Label(
          localizer.text("state.location_cache_save_failed"),
          systemImage: "exclamationmark.triangle"
        )
        .foregroundStyle(.red)
      }

      if model.settings.locationMode == .automatic {
        automaticFields
      } else {
        manualFields
      }
    }
  }

  private var automaticFields: some View {
    Group {
      Text(localizer.text("settings.location_privacy_help"))
        .font(.callout)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      automaticAction
    }
  }

  @ViewBuilder
  private var automaticAction: some View {
    switch model.locationState {
    case .denied, .restricted:
      Button(localizer.text("action.open_location_settings")) {
        model.showLocationSettings()
      }
    case .requestingPermission, .requestingLocation:
      ProgressView()
        .controlSize(.small)
    case .notConfigured, .available, .failed, .invalidManualInput:
      Button(localizer.text("action.use_current_location")) {
        model.requestAutomaticLocation()
      }
    }
  }

  private var manualFields: some View {
    Group {
      TextField(localizer.text("settings.location_label"), text: $manualLabel)

      HStack(alignment: .firstTextBaseline, spacing: 12) {
        TextField(localizer.text("settings.latitude"), text: $latitudeText)
          .accessibilityLabel(localizer.text("settings.latitude"))
        TextField(localizer.text("settings.longitude"), text: $longitudeText)
          .accessibilityLabel(localizer.text("settings.longitude"))
      }

      Text(localizer.text("settings.manual_location_help"))
        .font(.callout)
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      Button(localizer.text("action.apply_location")) {
        _ = model.applyManualLocation(
          latitude: latitudeText,
          longitude: longitudeText,
          label: manualLabel
        )
      }
      .buttonStyle(.borderedProminent)
    }
  }

  private var statusSymbol: String {
    switch model.locationState {
    case .available:
      return "location.fill"
    case .requestingPermission, .requestingLocation:
      return "location"
    case .notConfigured, .denied, .restricted, .failed, .invalidManualInput:
      return "exclamationmark.triangle"
    }
  }
}
