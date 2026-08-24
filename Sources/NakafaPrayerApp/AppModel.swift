import Combine
import Foundation
import NakafaPrayerCore
import OSLog

/// Main coordinator for preferences, location, reminders, and Focus Mode.
@MainActor
public final class AppModel: ObservableObject {
  @Published private(set) var settings: PrayerSettings
  @Published var nextPrayer: PrayerOccurrence?
  @Published var locationState: LocationState
  @Published var notificationState: NotificationPermissionState = .notDetermined
  @Published var audioPreviewState: AudioPreviewState = .idle
  @Published private(set) var launchAtLoginState: LaunchAtLoginState = .disabled
  @Published private(set) var settingsRecovery: SettingsRecovery
  @Published private(set) var settingsSaveFailed = false
  @Published var locationCacheSaveFailed = false
  @Published var calculationFailed = false
  @Published var isFocusModeActive = false

  let calculator = PrayerCalculator()

  let audioPreview = AdhanPreviewPlayer()
  let focusActivationPolicy = FocusActivationPolicy()
  let focusOverlay = FocusOverlayController()
  let launchAtLogin = LaunchAtLoginController()
  let locationCache = LocationCache()
  let locationService = LocationService()
  let logger = Logger(subsystem: "ai.nakafa.prayer", category: "AppModel")
  let notificationScheduler = LocalNotificationScheduler()
  let schedulePlanner = PrayerSchedulePlanner()
  let store = SettingsStore()

  var automaticLocation: LocationSnapshot?
  var transitionTimer: Timer?
  var notificationTask: Task<Void, Never>?
  var observers: [NSObjectProtocol] = []
  var scheduleRevision = 0
  private var started = false

  /// Creates the app model and performs local settings migration without prompting.
  public init() {
    let loaded = store.load()
    let initialSettings = loaded.settings
    settings = initialSettings
    settingsRecovery = loaded.recovery

    let initialAutomaticLocation: LocationSnapshot?
    var initialLocationCacheSaveFailed = false
    if let migratedCoordinates = loaded.migratedAutomaticCoordinates {
      let snapshot = LocationSnapshot(
        coordinates: migratedCoordinates,
        capturedAt: Date()
      )
      initialAutomaticLocation = snapshot
      initialLocationCacheSaveFailed = locationCache.save(snapshot) == false
    } else {
      initialAutomaticLocation = locationCache.load()
    }
    automaticLocation = initialAutomaticLocation

    if initialSettings.locationMode == .manual,
      let coordinates = initialSettings.manualCoordinates
    {
      locationState = .available(
        LocationSnapshot(coordinates: coordinates, capturedAt: Date())
      )
    } else if let initialAutomaticLocation {
      locationState = .available(initialAutomaticLocation)
    } else {
      locationState = .notConfigured
    }

    locationCacheSaveFailed = initialLocationCacheSaveFailed
    settingsSaveFailed = store.save(initialSettings) == false
  }

  var localizer: Localizer {
    Localizer(language: settings.language)
  }

  var activeCoordinates: PrayerCoordinates? {
    switch settings.locationMode {
    case .automatic:
      return automaticLocation?.coordinates
    case .manual:
      return settings.manualCoordinates
    }
  }

  /// Starts lifecycle observation and reconciles local state once.
  func start() {
    guard started == false else {
      return
    }

    started = true
    configureServiceCallbacks()
    observeLifecycleChanges()
    launchAtLoginState = launchAtLogin.apply(enabled: settings.launchAtLogin)

    if settings.locationMode == .automatic {
      locationService.refreshIfAuthorized()
    }

    reconcileSchedule()
  }

  /// Stops task-owned runtime work before app termination.
  func prepareForTermination() {
    transitionTimer?.invalidate()
    transitionTimer = nil
    notificationTask?.cancel()
    notificationTask = nil
    audioPreview.stop()
    focusOverlay.stopForTermination()
    isFocusModeActive = false
    removeLifecycleObservers()
  }

  func updateSettings(
    affectsSchedule: Bool,
    _ update: (inout PrayerSettings) -> Void
  ) {
    var updated = settings
    update(&updated)

    guard updated != settings else {
      return
    }

    settings = updated
    settingsSaveFailed = store.save(updated) == false

    if affectsSchedule {
      reconcileSchedule()
    }
  }

  func setManualLocationState(_ state: LocationState) {
    locationState = state
  }

  func requestAutomaticLocationFromUserAction() {
    locationService.requestAutomaticLocation()
  }

  func requestNotificationPermissionFromUserAction() async {
    notificationState = await notificationScheduler.requestPermission()
    reconcileSchedule()
  }

  func applyLaunchAtLogin(enabled: Bool) {
    launchAtLoginState = launchAtLogin.apply(enabled: enabled)
  }

  func openLoginItemsSettings() {
    launchAtLogin.openSystemSettings()
  }

  func playAdhanPreview() {
    audioPreview.play()
  }

  func stopAdhanPreview() {
    audioPreview.stop()
  }

  func stopActiveFocusMode() {
    focusOverlay.stop()
  }

  func previewFocusMode() {
    guard focusOverlay.isActive == false else {
      return
    }

    startFocusMode(prayer: .dhuhr, duration: 15)
  }
}
