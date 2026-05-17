import Adhan
import Foundation

public enum CalculationMethodID: String, CaseIterable, Codable, Identifiable, Sendable {
    case muslimWorldLeague
    case egyptian
    case karachi
    case ummAlQura
    case dubai
    case moonsightingCommittee
    case northAmerica
    case kuwait
    case qatar
    case singapore
    case tehran
    case turkey

    public var id: String { rawValue }

    var adhanMethod: CalculationMethod {
        CalculationMethod(rawValue: rawValue) ?? .muslimWorldLeague
    }
}

public enum MadhabID: String, CaseIterable, Codable, Identifiable, Sendable {
    case shafi
    case hanafi

    public var id: String { rawValue }

    var adhanMadhab: Madhab {
        switch self {
        case .shafi:
            return .shafi
        case .hanafi:
            return .hanafi
        }
    }
}

public struct PrayerSettings: Codable, Equatable, Sendable {
    public var language: AppLanguage
    public var calculationMethod: CalculationMethodID
    public var madhab: MadhabID
    public var lockDurationMinutes: Int
    public var launchAtLogin: Bool
    public var adhanEnabled: Bool
    public var ttsEnabled: Bool
    public var useManualCoordinates: Bool
    public var manualCoordinates: PrayerCoordinates
    public var lastKnownCoordinates: PrayerCoordinates?

    public init(
        language: AppLanguage = .system,
        calculationMethod: CalculationMethodID = .muslimWorldLeague,
        madhab: MadhabID = .shafi,
        lockDurationMinutes: Int = 10,
        launchAtLogin: Bool = true,
        adhanEnabled: Bool = true,
        ttsEnabled: Bool = true,
        useManualCoordinates: Bool = false,
        manualCoordinates: PrayerCoordinates = PrayerCoordinates(latitude: -6.2, longitude: 106.816_666),
        lastKnownCoordinates: PrayerCoordinates? = nil
    ) {
        self.language = language
        self.calculationMethod = calculationMethod
        self.madhab = madhab
        self.lockDurationMinutes = lockDurationMinutes
        self.launchAtLogin = launchAtLogin
        self.adhanEnabled = adhanEnabled
        self.ttsEnabled = ttsEnabled
        self.useManualCoordinates = useManualCoordinates
        self.manualCoordinates = manualCoordinates
        self.lastKnownCoordinates = lastKnownCoordinates
    }

    public var activeCoordinates: PrayerCoordinates? {
        if useManualCoordinates, manualCoordinates.isValid {
            return manualCoordinates
        }

        guard let lastKnownCoordinates, lastKnownCoordinates.isValid else {
            return nil
        }

        return lastKnownCoordinates
    }

    public var clampedLockDuration: TimeInterval {
        TimeInterval(min(max(lockDurationMinutes, 1), 60) * 60)
    }
}
