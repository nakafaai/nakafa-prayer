import Combine
import Foundation
import ServiceManagement
import NakafaPrayerCore

@MainActor
final class AppModel: ObservableObject {
    @Published var settings: PrayerSettings
    @Published private(set) var nextPrayer: PrayerTime?
    @Published private(set) var statusText = ""

    private let audio = ReminderAudio()
    private let calculator = PrayerCalculator()
    private let locationService = LocationService()
    private let lockOverlay = LockOverlayController()
    private let resolver = NextPrayerResolver()
    private let store = SettingsStore()
    private var timer: Timer?

    init() {
        settings = store.load()
        refreshStatus()
    }

    var isLocked: Bool {
        lockOverlay.isActive
    }

    var localizer: Localizer {
        Localizer(language: settings.language)
    }

    func start() {
        locationService.onLocation = { [weak self] coordinates in
            self?.settings.lastKnownCoordinates = coordinates
            self?.saveSettings()
        }

        requestLocationIfNeeded()
        applyLaunchAtLogin()
        reschedule()
    }

    func saveSettings() {
        store.save(settings)
        applyLaunchAtLogin()
        reschedule()
    }

    func requestLocationIfNeeded() {
        guard settings.useManualCoordinates == false else {
            return
        }

        locationService.requestLocation()
    }

    func testLock() {
        beginReminder(for: .dhuhr, duration: 15)
    }

    func reschedule() {
        timer?.invalidate()
        refreshStatus()

        guard let coordinates = settings.activeCoordinates else {
            nextPrayer = nil
            return
        }

        do {
            let next = try resolver.nextPrayer(
                after: Date(),
                coordinates: coordinates,
                settings: settings
            )
            nextPrayer = next
            refreshStatus()
            scheduleTimer(for: next)
        } catch {
            nextPrayer = nil
        }
    }

    private func scheduleTimer(for prayer: PrayerTime) {
        let delay = max(prayer.date.timeIntervalSinceNow, 1)
        let prayerID = prayer.prayer
        timer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
            Task { @MainActor in
                self?.beginReminder(for: prayerID)
            }
        }
    }

    private func beginReminder(for prayer: PrayerID, duration: TimeInterval? = nil) {
        let localizer = localizer
        audio.playReminder(for: prayer, settings: settings, localizer: localizer)
        lockOverlay.start(
            prayer: prayer,
            duration: duration ?? settings.clampedLockDuration,
            localizer: localizer
        ) { [weak self] in
            self?.reschedule()
        }
    }

    private func refreshStatus() {
        guard let nextPrayer else {
            statusText = localizer.text("app.no_coordinates")
            return
        }

        let formatter = TimeFormatting(locale: localizer.locale)
        statusText = localizer.text(
            "app.next_prayer",
            localizer.prayerName(nextPrayer.prayer),
            formatter.time(nextPrayer.date)
        )
    }

    private func applyLaunchAtLogin() {
        guard Bundle.main.bundleURL.pathExtension == "app" else {
            return
        }

        let service = SMAppService.mainApp

        do {
            if settings.launchAtLogin, service.status != .enabled {
                try service.register()
            }

            if settings.launchAtLogin == false, service.status == .enabled {
                try service.unregister()
            }
        } catch {
            return
        }
    }
}
