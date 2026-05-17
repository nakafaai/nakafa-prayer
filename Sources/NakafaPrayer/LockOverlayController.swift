import AppKit
import NakafaPrayerCore
import SwiftUI

/// Presents and releases the strict recoverable lock overlay.
///
/// The controller uses public AppKit APIs only. It hides normal macOS chrome and
/// blocks app switching while the timer is active, then restores the previous
/// presentation options when the lock finishes.
@MainActor
final class LockOverlayController {
  private var previousOptions: NSApplication.PresentationOptions = []
  private var state: LockState?
  private var timer: Timer?
  private var windows: [NSWindow] = []

  var isActive: Bool {
    windows.isEmpty == false
  }

  /// Starts one lock session across all connected displays.
  func start(
    prayer: PrayerID,
    duration: TimeInterval,
    localizer: Localizer,
    onFinish: @escaping @MainActor @Sendable () -> Void
  ) {
    guard isActive == false else {
      return
    }

    previousOptions = NSApp.presentationOptions
    NSApp.activate(ignoringOtherApps: true)
    NSApp.presentationOptions = [
      .hideDock,
      .hideMenuBar,
      .disableHideApplication,
      .disableProcessSwitching,
    ]

    let state = LockState(
      title: localizer.text("lock.title", localizer.prayerName(prayer)),
      message: localizer.text("lock.message"),
      emergencyText: localizer.text("lock.emergency"),
      countdownPrefix: localizer.text("lock.countdown", "%@"),
      locale: localizer.locale,
      endsAt: Date().addingTimeInterval(duration)
    )
    self.state = state

    windows = NSScreen.screens.map { screen in
      makeWindow(screen: screen, state: state)
    }

    for window in windows {
      window.makeKeyAndOrderFront(nil)
    }
    scheduleTick(onFinish: onFinish)
  }

  /// Releases all overlay windows and restores the previous app presentation options.
  func finish() {
    timer?.invalidate()
    timer = nil
    for window in windows {
      window.close()
    }
    windows = []
    state = nil
    NSApp.presentationOptions = previousOptions
  }

  private func makeWindow(screen: NSScreen, state: LockState) -> NSWindow {
    let view = LockOverlayView(state: state) { [weak self] in
      self?.finish()
    }

    let window = NSWindow(
      contentRect: screen.frame,
      styleMask: [.borderless],
      backing: .buffered,
      defer: false,
      screen: screen
    )
    window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
    window.contentView = NSHostingView(rootView: view)
    window.isOpaque = true
    window.level = .screenSaver
    window.setFrame(screen.frame, display: true)
    return window
  }

  private func scheduleTick(onFinish: @escaping @MainActor @Sendable () -> Void) {
    timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
      Task { @MainActor in
        guard let self, let state = self.state else {
          return
        }

        state.tick()

        if state.remaining <= 0 {
          self.finish()
          onFinish()
        }
      }
    }
  }
}

/// Observable state rendered by every full-screen lock window.
@MainActor
final class LockState: ObservableObject {
  let title: String
  let message: String
  let emergencyText: String
  let countdownPrefix: String
  let locale: Locale
  let endsAt: Date

  @Published private(set) var remaining: TimeInterval

  init(
    title: String,
    message: String,
    emergencyText: String,
    countdownPrefix: String,
    locale: Locale,
    endsAt: Date
  ) {
    self.title = title
    self.message = message
    self.emergencyText = emergencyText
    self.countdownPrefix = countdownPrefix
    self.locale = locale
    self.endsAt = endsAt
    remaining = max(endsAt.timeIntervalSinceNow, 0)
  }

  /// Countdown text with localized surrounding copy.
  var countdownText: String {
    let formatted = TimeFormatting(locale: locale).countdown(remaining)
    return countdownPrefix.replacingOccurrences(of: "%@", with: formatted)
  }

  /// Refreshes remaining time from the wall clock.
  func tick() {
    remaining = max(endsAt.timeIntervalSinceNow, 0)
  }
}

/// Full-screen SwiftUI surface shown while the lock is active.
struct LockOverlayView: View {
  @ObservedObject var state: LockState
  let emergencyRelease: () -> Void

  var body: some View {
    ZStack {
      Color.black

      VStack(spacing: 24) {
        Text(state.title)
          .font(.system(size: 56, weight: .bold, design: .rounded))
          .multilineTextAlignment(.center)

        Text(state.message)
          .font(.title2)
          .multilineTextAlignment(.center)

        Text(state.countdownText)
          .font(.system(size: 44, weight: .semibold, design: .monospaced))

        Text(state.emergencyText)
          .font(.callout)
          .foregroundStyle(.secondary)
          .padding(.top, 16)
          .onLongPressGesture(minimumDuration: 8) {
            emergencyRelease()
          }
      }
      .foregroundStyle(.white)
      .padding(48)
      .frame(maxWidth: 900)
    }
    .ignoresSafeArea()
  }
}
