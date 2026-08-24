import SwiftUI

/// Full-screen SwiftUI surface shown during an explicitly enabled Focus Mode session.
struct FocusOverlayView: View {
  @ObservedObject var state: FocusSessionState
  let endFocus: () -> Void

  @FocusState private var endButtonFocused: Bool
  @State private var showsEndConfirmation = false

  var body: some View {
    ZStack {
      Color.black

      VStack(spacing: 28) {
        Text(state.title)
          .font(.system(.largeTitle, design: .rounded, weight: .bold))
          .multilineTextAlignment(.center)

        Text(state.message)
          .font(.title2)
          .multilineTextAlignment(.center)

        Text(state.countdownText)
          .font(.system(.title, design: .monospaced, weight: .semibold))
          .accessibilityLabel(state.countdownText)

        Button(state.endActionText) {
          showsEndConfirmation = true
        }
        .buttonStyle(.borderedProminent)
        .controlSize(.large)
        .tint(.red)
        .focused($endButtonFocused)
        .keyboardShortcut(.escape, modifiers: [])
        .accessibilityHint(state.endHint)
        .accessibilityAction(named: Text(state.endActionText)) {
          showsEndConfirmation = true
        }
      }
      .foregroundStyle(.white)
      .padding(48)
      .frame(maxWidth: 900)
    }
    .ignoresSafeArea()
    .defaultFocus($endButtonFocused, true)
    .alert(state.confirmationTitle, isPresented: $showsEndConfirmation) {
      Button(state.endActionText, role: .destructive, action: endFocus)
      Button(state.cancelText, role: .cancel) {}
    } message: {
      Text(state.confirmationMessage)
    }
  }
}
