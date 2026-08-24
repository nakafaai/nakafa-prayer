import Foundation
import NakafaPrayerCore

extension AppModel {
  var statusText: String {
    if let nextPrayer {
      return localizer.text(
        "app.next_prayer",
        localizer.prayerName(nextPrayer.prayer),
        TimeFormatting(locale: localizer.locale).time(nextPrayer.date)
      )
    }

    if calculationFailed {
      return localizer.text("state.calculation_failed")
    }

    return locationStatusText
  }

  var statusSymbol: String {
    if nextPrayer != nil {
      return "clock"
    }

    if calculationFailed {
      return "exclamationmark.triangle"
    }

    return "location.slash"
  }

  var locationText: String {
    guard let coordinates = activeCoordinates else {
      return locationStatusText
    }

    switch settings.locationMode {
    case .automatic:
      return localizer.text(
        "app.location_automatic_coordinates",
        coordinates.latitude,
        coordinates.longitude
      )
    case .manual:
      if let label = settings.manualLocationLabel {
        return localizer.text("app.location_manual_label", label)
      }

      return localizer.text(
        "app.location_manual_coordinates",
        coordinates.latitude,
        coordinates.longitude
      )
    }
  }

  var locationStatusText: String {
    switch locationState {
    case .notConfigured:
      return localizer.text("state.location_not_configured")
    case .requestingPermission:
      return localizer.text("state.location_requesting_permission")
    case .requestingLocation:
      return localizer.text("state.location_requesting")
    case .available:
      return localizer.text("state.location_available")
    case .denied:
      return localizer.text("state.location_denied")
    case .restricted:
      return localizer.text("state.location_restricted")
    case .failed:
      return localizer.text("state.location_failed")
    case .invalidManualInput:
      return localizer.text("state.location_invalid_manual")
    }
  }

  var notificationStatusText: String {
    switch notificationState {
    case .notDetermined:
      return localizer.text("state.notifications_not_determined")
    case .authorized:
      return localizer.text("state.notifications_authorized")
    case .denied:
      return localizer.text("state.notifications_denied")
    case .alertsDisabled:
      return localizer.text("state.notifications_alerts_disabled")
    case .soundDisabled:
      return localizer.text("state.notifications_sound_disabled")
    case .authorizationFailed:
      return localizer.text("state.notifications_authorization_failed")
    case .schedulingFailed:
      return localizer.text("state.notifications_scheduling_failed")
    }
  }

  var notificationStatusSymbol: String {
    switch notificationState {
    case .authorized:
      return "bell.badge"
    case .soundDisabled:
      return "bell.slash"
    case .notDetermined:
      return "bell"
    case .denied, .alertsDisabled, .authorizationFailed, .schedulingFailed:
      return "exclamationmark.triangle"
    }
  }

  var calculationText: String {
    localizer.text(
      "app.calculation_summary",
      localizer.text("method.\(settings.calculationMethod.rawValue)"),
      localizer.text("madhab.\(settings.madhab.rawValue)")
    )
  }

  var menuPrayerTimesTitle: String {
    let key =
      Calendar.autoupdatingCurrent.isDateInTomorrow(menuPrayerDate)
      ? "app.tomorrow_prayer_times"
      : "app.today_prayer_times"

    return localizer.text(key)
  }

  var menuPrayerTimes: [PrayerTime] {
    guard let coordinates = activeCoordinates else {
      return []
    }

    return
      (try? calculator.schedule(
        for: menuPrayerDate,
        coordinates: coordinates,
        settings: settings
      ).times) ?? []
  }

  func prayerTimeMenuText(for prayerTime: PrayerTime) -> String {
    localizer.text(
      "app.prayer_time_menu_item",
      localizer.prayerName(prayerTime.prayer),
      TimeFormatting(locale: localizer.locale).time(prayerTime.date)
    )
  }

  func isNextPrayerTime(_ prayerTime: PrayerTime) -> Bool {
    guard let nextPrayer else {
      return false
    }

    return nextPrayer.prayer == prayerTime.prayer
      && Calendar.autoupdatingCurrent.isDate(nextPrayer.date, inSameDayAs: prayerTime.date)
  }

  func prayerTimeAccessibilityLabel(for prayerTime: PrayerTime) -> String {
    let name = localizer.prayerName(prayerTime.prayer)
    let time = TimeFormatting(locale: localizer.locale).time(prayerTime.date)

    if isNextPrayerTime(prayerTime) {
      return localizer.text("app.next_prayer_accessibility", name, time)
    }

    return localizer.text("app.prayer_time_accessibility", name, time)
  }

  private var menuPrayerDate: Date {
    nextPrayer?.date ?? Date()
  }
}
