import Adhan
import Foundation

public enum PrayerID: String, CaseIterable, Codable, Identifiable, Sendable {
    case fajr
    case dhuhr
    case asr
    case maghrib
    case isha

    public var id: String { rawValue }

    var adhanPrayer: Prayer {
        switch self {
        case .fajr:
            return .fajr
        case .dhuhr:
            return .dhuhr
        case .asr:
            return .asr
        case .maghrib:
            return .maghrib
        case .isha:
            return .isha
        }
    }

    public var localizationKey: String {
        "prayer.\(rawValue)"
    }
}
