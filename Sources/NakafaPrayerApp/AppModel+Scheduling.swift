import AppKit
import Foundation
import NakafaPrayerCore
import OSLog

extension AppModel {
  /// Recalculates the rolling reminder plan from committed settings and coordinates.
  func reconcileSchedule() {
    transitionTimer?.invalidate()
    transitionTimer = nil
    scheduleRevision += 1
    let revision = scheduleRevision
    calculationFailed = false

    guard let coordinates = activeCoordinates else {
      nextPrayer = nil
      removeScheduledNotifications(revision: revision)
      return
    }

    let occurrences: [PrayerOccurrence]
    do {
      occurrences = try schedulePlanner.occurrences(
        startingAt: Date(),
        coordinates: coordinates,
        settings: settings
      )
    } catch {
      logger.error("Prayer planning failed: \(error.localizedDescription, privacy: .public)")
      nextPrayer = nil
      calculationFailed = true
      removeScheduledNotifications(revision: revision)
      return
    }

    nextPrayer = occurrences.first
    scheduleNextTransition()

    let localizer = localizer
    let adhanEnabled = settings.adhanEnabled
    replaceNotificationTask(revision: revision) { model in
      await model.notificationScheduler.reconcile(
        occurrences: occurrences,
        localizer: localizer,
        adhanEnabled: adhanEnabled
      )
    }
  }

  func configureServiceCallbacks() {
    locationService.onStateChange = { [weak self] state in
      self?.handleLocationState(state)
    }

    audioPreview.onStateChange = { [weak self] state in
      self?.audioPreviewState = state
    }
  }

  func handleLifecycleChange() {
    if let nextPrayer, nextPrayer.date <= Date() {
      handleDueOccurrence(nextPrayer)
      return
    }

    reconcileSchedule()
  }

  func observeLifecycleChanges() {
    let center = NotificationCenter.default
    let names: [Notification.Name] = [
      .NSSystemClockDidChange,
      .NSSystemTimeZoneDidChange,
      .NSCalendarDayChanged,
    ]

    for name in names {
      observers.append(
        center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
          Task { @MainActor in
            self?.handleLifecycleChange()
          }
        }
      )
    }

    observers.append(
      NSWorkspace.shared.notificationCenter.addObserver(
        forName: NSWorkspace.didWakeNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        Task { @MainActor in
          guard let self else {
            return
          }

          if self.settings.locationMode == .automatic {
            self.locationService.refreshIfAuthorized()
          }
          self.handleLifecycleChange()
        }
      }
    )
  }

  func removeLifecycleObservers() {
    let defaultCenter = NotificationCenter.default
    let workspaceCenter = NSWorkspace.shared.notificationCenter

    for observer in observers {
      defaultCenter.removeObserver(observer)
      workspaceCenter.removeObserver(observer)
    }
    observers = []
  }

  func startFocusMode(prayer: PrayerID, duration: TimeInterval) {
    audioPreview.stop()
    isFocusModeActive = true
    focusOverlay.start(
      prayer: prayer,
      duration: duration,
      localizer: localizer
    ) { [weak self] in
      guard let self else {
        return
      }

      isFocusModeActive = false
      reconcileSchedule()
    }
  }

  private func handleLocationState(_ state: LocationState) {
    locationState = state

    guard case .available(let snapshot) = state else {
      return
    }

    automaticLocation = snapshot
    locationCacheSaveFailed = locationCache.save(snapshot) == false
    if locationCacheSaveFailed {
      logger.error("Automatic location could not be saved locally.")
    }
    reconcileSchedule()
  }

  private func removeScheduledNotifications(revision: Int) {
    replaceNotificationTask(revision: revision) { model in
      await model.notificationScheduler.removeAllOwnedRequests()
      return await model.notificationScheduler.currentPermissionState()
    }
  }

  private func replaceNotificationTask(
    revision: Int,
    update: @escaping @MainActor (AppModel) async -> NotificationPermissionState
  ) {
    let previousTask = notificationTask
    previousTask?.cancel()

    notificationTask = Task { @MainActor [weak self] in
      _ = await previousTask?.value

      guard let self,
        Task.isCancelled == false,
        scheduleRevision == revision
      else {
        return
      }

      let state = await update(self)
      guard Task.isCancelled == false, scheduleRevision == revision else {
        return
      }
      notificationState = state
    }
  }

  private func scheduleNextTransition() {
    guard let nextPrayer else {
      return
    }

    let timer = Timer(fire: nextPrayer.date, interval: 0, repeats: false) {
      [weak self] _ in
      Task { @MainActor in
        self?.handleDueOccurrence(nextPrayer)
      }
    }
    timer.tolerance = 1
    RunLoop.main.add(timer, forMode: .common)
    transitionTimer = timer
  }

  private func handleDueOccurrence(_ occurrence: PrayerOccurrence) {
    guard nextPrayer?.id == occurrence.id else {
      return
    }

    let shouldStartFocus =
      settings.isFocusModeEnabled
      && focusActivationPolicy.shouldStart(scheduledAt: occurrence.date, now: Date())

    guard shouldStartFocus, focusOverlay.isActive == false else {
      reconcileSchedule()
      return
    }

    startFocusMode(
      prayer: occurrence.prayer,
      duration: settings.clampedFocusDuration
    )
  }
}
