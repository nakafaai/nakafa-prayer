import AVFoundation
import Foundation
import NakafaPrayerCore

/// Plays the audible reminder for a due prayer.
///
/// A bundled `adhan.mp3` is optional. TTS always uses localized text from the
/// String Catalog and the currently selected app language.
@MainActor
final class ReminderAudio {
  private var player: AVAudioPlayer?
  private let speech = AVSpeechSynthesizer()

  /// Plays adhan audio when available and speaks the localized reminder.
  func playReminder(
    for prayer: PrayerID,
    settings: PrayerSettings,
    localizer: Localizer
  ) {
    if settings.adhanEnabled {
      playBundledAdhan()
    }

    guard settings.ttsEnabled else {
      return
    }

    let phrase = localizer.text("tts.prayer_due", localizer.prayerName(prayer))
    let utterance = AVSpeechUtterance(string: phrase)
    utterance.voice = AVSpeechSynthesisVoice(language: localizer.localeIdentifier)
    speech.speak(utterance)
  }

  private func playBundledAdhan() {
    guard let url = bundledAdhanURL() else {
      return
    }

    do {
      player = try AVAudioPlayer(contentsOf: url)
      player?.prepareToPlay()
      player?.play()
    } catch {
      player = nil
    }
  }

  private func bundledAdhanURL() -> URL? {
    let appBundle = Bundle.main.resourceURL?.appendingPathComponent(
      "nakafa-prayer_NakafaPrayer.bundle")

    if let appBundle,
      let bundle = Bundle(url: appBundle),
      let url = bundle.url(forResource: "adhan", withExtension: "mp3")
    {
      return url
    }

    if let url = Bundle.main.url(forResource: "adhan", withExtension: "mp3") {
      return url
    }

    guard Bundle.main.bundleURL.pathExtension != "app" else {
      return nil
    }

    return Bundle.module.url(forResource: "adhan", withExtension: "mp3")
  }
}
