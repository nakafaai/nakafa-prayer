import AVFoundation
import Foundation
import NakafaPrayerCore

@MainActor
final class ReminderAudio {
    private var player: AVAudioPlayer?
    private let speech = AVSpeechSynthesizer()

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
        guard let url = Bundle.main.url(forResource: "adhan", withExtension: "mp3") else {
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
}
