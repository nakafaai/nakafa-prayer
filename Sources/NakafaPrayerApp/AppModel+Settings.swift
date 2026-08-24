import AppKit
import Foundation
import NakafaPrayerCore

extension AppModel {
  func setLanguage(_ language: AppLanguage) {
    updateSettings(affectsSchedule: true) {
      $0.language = language
    }
  }

  func setCalculationMethod(_ method: CalculationMethodID) {
    updateSettings(affectsSchedule: true) {
      $0.calculationMethod = method
    }
  }

  func setMadhab(_ madhab: MadhabID) {
    updateSettings(affectsSchedule: true) {
      $0.madhab = madhab
    }
  }

  func setAdhanEnabled(_ enabled: Bool) {
    if enabled == false {
      stopAdhanPreview()
    }

    updateSettings(affectsSchedule: true) {
      $0.adhanEnabled = enabled
    }
  }

  func setFocusDuration(_ minutes: Int) {
    updateSettings(affectsSchedule: false) {
      $0.focusDurationMinutes = min(max(minutes, 1), 60)
    }
  }

  func enableFocusMode() {
    updateSettings(affectsSchedule: false) {
      $0.reminderMode = .focus
      $0.focusConsentVersion = PrayerSettings.currentFocusConsentVersion
    }
  }

  func disableFocusMode() {
    stopActiveFocusMode()
    updateSettings(affectsSchedule: false) {
      $0.reminderMode = .notification
      $0.focusConsentVersion = 0
    }
  }

  func setLocationMode(_ mode: LocationMode) {
    updateSettings(affectsSchedule: false) {
      $0.locationMode = mode
    }

    switch mode {
    case .manual:
      if let coordinates = settings.manualCoordinates {
        setManualLocationState(
          .available(LocationSnapshot(coordinates: coordinates, capturedAt: Date()))
        )
      } else {
        setManualLocationState(.notConfigured)
      }
      reconcileSchedule()
    case .automatic:
      if let automaticLocation {
        setManualLocationState(.available(automaticLocation))
      } else {
        setManualLocationState(.notConfigured)
      }
      reconcileSchedule()
      requestAutomaticLocationFromUserAction()
    }
  }

  @discardableResult
  func applyManualLocation(
    latitude: String,
    longitude: String,
    label: String
  ) -> Bool {
    let parser = ManualLocationParser()
    guard
      let coordinates = parser.coordinates(
        latitude: latitude,
        longitude: longitude,
        locale: localizer.locale
      )
    else {
      setManualLocationState(.invalidManualInput)
      return false
    }

    let trimmedLabel = label.trimmingCharacters(in: .whitespacesAndNewlines)
    updateSettings(affectsSchedule: false) {
      $0.locationMode = .manual
      $0.manualCoordinates = coordinates
      $0.manualLocationLabel = trimmedLabel.isEmpty ? nil : trimmedLabel
    }
    setManualLocationState(
      .available(LocationSnapshot(coordinates: coordinates, capturedAt: Date()))
    )
    reconcileSchedule()
    return true
  }

  func requestAutomaticLocation() {
    guard settings.locationMode == .automatic else {
      return
    }

    requestAutomaticLocationFromUserAction()
  }

  func requestNotificationPermission() {
    Task { @MainActor [weak self] in
      await self?.requestNotificationPermissionFromUserAction()
    }
  }

  func toggleAdhanPreview() {
    guard settings.adhanEnabled else {
      return
    }

    if audioPreviewState == .playing {
      stopAdhanPreview()
      return
    }

    playAdhanPreview()
  }

  func setLaunchAtLogin(_ enabled: Bool) {
    updateSettings(affectsSchedule: false) {
      $0.launchAtLogin = enabled
    }
    applyLaunchAtLogin(enabled: enabled)
  }

  func showLoginItemsSettings() {
    openLoginItemsSettings()
  }

  func showNotificationSettings() {
    openSystemSettings(
      "x-apple.systempreferences:com.apple.Notifications-Settings.extension"
    )
  }

  func showLocationSettings() {
    openSystemSettings(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_LocationServices"
    )
  }

  private func openSystemSettings(_ address: String) {
    guard let url = URL(string: address) else {
      return
    }

    NSWorkspace.shared.open(url)
  }
}
