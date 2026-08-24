import AVFoundation
import Foundation
import OSLog

/// User-visible state of the local adhan preview.
enum AudioPreviewState: Equatable, Sendable {
  case idle
  case playing
  case unavailable
  case failed
}

/// Plays only the bundled local adhan alert clip for Settings preview.
@MainActor
final class AdhanPreviewPlayer: NSObject, AVAudioPlayerDelegate {
  var onStateChange: ((AudioPreviewState) -> Void)?

  private let logger = Logger(subsystem: "ai.nakafa.prayer", category: "Audio")
  private var player: AVAudioPlayer?

  func play() {
    stop()

    guard let url = AdhanAudioResource.url else {
      onStateChange?(.unavailable)
      return
    }

    do {
      let player = try AVAudioPlayer(contentsOf: url)
      player.delegate = self
      player.prepareToPlay()

      guard player.play() else {
        onStateChange?(.failed)
        return
      }

      self.player = player
      onStateChange?(.playing)
    } catch {
      logger.error("Adhan preview failed: \(error.localizedDescription, privacy: .public)")
      player = nil
      onStateChange?(.failed)
    }
  }

  func stop() {
    player?.stop()
    player = nil
    onStateChange?(.idle)
  }

  nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
    Task { @MainActor in
      self.player = nil
      self.onStateChange?(flag ? .idle : .failed)
    }
  }
}
