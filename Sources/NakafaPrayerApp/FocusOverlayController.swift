import AppKit
import NakafaPrayerCore
import SwiftUI

/// Presents a user-controlled prayer Focus Mode across connected displays.
@MainActor
final class FocusOverlayController {
  private enum SessionPhase {
    case idle
    case active
    case finishing
  }

  private var phase = SessionPhase.idle
  private var previousOptions: NSApplication.PresentationOptions = []
  private var onFinish: (@MainActor @Sendable () -> Void)?
  private var state: FocusSessionState?
  private var timer: Timer?
  private var windows: [NSWindow] = []
  private var retiredWindows: [NSWindow] = []
  private var screenObserver: NSObjectProtocol?

  var isActive: Bool {
    phase == .active
  }

  /// Starts one consented Focus Mode session across all connected displays.
  func start(
    prayer: PrayerID,
    duration: TimeInterval,
    localizer: Localizer,
    onFinish: @escaping @MainActor @Sendable () -> Void
  ) {
    guard phase == .idle else {
      return
    }

    phase = .active
    previousOptions = NSApp.presentationOptions
    self.onFinish = onFinish
    state = FocusSessionState(
      title: localizer.text("focus.title", localizer.prayerName(prayer)),
      message: localizer.text("focus.message"),
      endActionText: localizer.text("focus.end"),
      endHint: localizer.text("focus.end_hint"),
      confirmationTitle: localizer.text("focus.end_confirmation_title"),
      confirmationMessage: localizer.text("focus.end_confirmation_message"),
      cancelText: localizer.text("focus.cancel"),
      countdownPrefix: localizer.text("focus.countdown", "%@"),
      locale: localizer.locale,
      endsAt: Date().addingTimeInterval(duration)
    )

    NSApp.activate(ignoringOtherApps: true)
    NSApp.presentationOptions = [.autoHideDock, .autoHideMenuBar]
    reconcileWindows()
    observeScreenChanges()
    scheduleTick()
  }

  /// Ends an active session immediately and restores normal macOS presentation.
  func stop(notify: Bool = true) {
    guard phase == .active else {
      return
    }

    phase = .finishing
    Task { @MainActor [weak self] in
      await Task.yield()
      self?.finish(notify: notify)
    }
  }

  /// Synchronous teardown used before app termination.
  func stopForTermination() {
    guard phase != .idle else {
      return
    }

    finish(notify: false)
  }

  private func finish(notify: Bool) {
    let callback = notify ? onFinish : nil
    let finishedWindows = windows

    onFinish = nil
    timer?.invalidate()
    timer = nil
    removeScreenObserver()
    retire(finishedWindows)
    windows = []
    state = nil
    NSApp.presentationOptions = previousOptions
    phase = .idle
    callback?()
  }

  private func observeScreenChanges() {
    screenObserver = NotificationCenter.default.addObserver(
      forName: NSApplication.didChangeScreenParametersNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      Task { @MainActor in
        self?.reconcileWindows()
      }
    }
  }

  private func removeScreenObserver() {
    if let screenObserver {
      NotificationCenter.default.removeObserver(screenObserver)
    }
    screenObserver = nil
  }

  private func reconcileWindows() {
    guard phase == .active, let state else {
      return
    }

    let previousWindows = windows
    windows = NSScreen.screens.map { makeWindow(screen: $0, state: state) }

    for window in windows {
      window.makeKeyAndOrderFront(nil)
    }

    retire(previousWindows)
  }

  private func retire(_ finishedWindows: [NSWindow]) {
    guard finishedWindows.isEmpty == false else {
      return
    }

    for window in finishedWindows {
      window.orderOut(nil)
      window.contentView = nil
    }

    retiredWindows.append(contentsOf: finishedWindows)

    Task { @MainActor [weak self] in
      try? await Task.sleep(for: .seconds(2))
      guard let self else {
        return
      }

      for window in finishedWindows {
        window.close()
      }

      retiredWindows.removeAll { retiredWindow in
        finishedWindows.contains { $0 === retiredWindow }
      }
    }
  }

  private func makeWindow(screen: NSScreen, state: FocusSessionState) -> NSWindow {
    let view = FocusOverlayView(state: state) { [weak self] in
      self?.stop()
    }
    let window = FocusWindow(
      contentRect: screen.frame,
      styleMask: [.borderless],
      backing: .buffered,
      defer: false,
      screen: screen
    )
    window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
    window.contentView = NSHostingView(rootView: view)
    window.animationBehavior = .none
    window.backgroundColor = .black
    window.hasShadow = false
    window.isReleasedWhenClosed = false
    window.isOpaque = true
    window.level = .floating
    window.setFrame(screen.frame, display: true)
    return window
  }

  private func scheduleTick() {
    timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
      Task { @MainActor in
        guard let self, let state = self.state else {
          return
        }

        state.tick()

        if state.remaining <= 0 {
          self.stop()
        }
      }
    }
  }
}

/// Borderless windows do not accept keyboard focus unless they opt in explicitly.
private final class FocusWindow: NSWindow {
  override var canBecomeKey: Bool {
    true
  }
}

/// Observable text and countdown rendered by each Focus Mode window.
@MainActor
final class FocusSessionState: ObservableObject {
  let title: String
  let message: String
  let endActionText: String
  let endHint: String
  let confirmationTitle: String
  let confirmationMessage: String
  let cancelText: String
  let countdownPrefix: String
  let locale: Locale
  let endsAt: Date

  @Published private(set) var remaining: TimeInterval

  init(
    title: String,
    message: String,
    endActionText: String,
    endHint: String,
    confirmationTitle: String,
    confirmationMessage: String,
    cancelText: String,
    countdownPrefix: String,
    locale: Locale,
    endsAt: Date
  ) {
    self.title = title
    self.message = message
    self.endActionText = endActionText
    self.endHint = endHint
    self.confirmationTitle = confirmationTitle
    self.confirmationMessage = confirmationMessage
    self.cancelText = cancelText
    self.countdownPrefix = countdownPrefix
    self.locale = locale
    self.endsAt = endsAt
    remaining = max(endsAt.timeIntervalSinceNow, 0)
  }

  var countdownText: String {
    let formatted = TimeFormatting(locale: locale).countdown(remaining)
    return countdownPrefix.replacingOccurrences(of: "%@", with: formatted)
  }

  func tick() {
    remaining = max(endsAt.timeIntervalSinceNow, 0)
  }
}
