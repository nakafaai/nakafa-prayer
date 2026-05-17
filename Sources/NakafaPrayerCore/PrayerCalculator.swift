import Adhan
import Foundation

public struct PrayerTime: Equatable, Identifiable, Sendable {
    public var prayer: PrayerID
    public var date: Date

    public var id: PrayerID { prayer }
}

public struct DailyPrayerSchedule: Equatable, Sendable {
    public var date: Date
    public var times: [PrayerTime]

    public func nextPrayer(after now: Date) -> PrayerTime? {
        times.first { $0.date > now }
    }
}

public enum PrayerCalculationError: Error, Equatable, Sendable {
    case invalidCoordinates
    case unavailableTimes
}

public struct PrayerCalculator: Sendable {
    private let calendar: Calendar

    public init(calendar: Calendar = .gregorianUTC) {
        self.calendar = calendar
    }

    public func schedule(
        for date: Date,
        coordinates: PrayerCoordinates,
        settings: PrayerSettings
    ) throws -> DailyPrayerSchedule {
        guard coordinates.isValid else {
            throw PrayerCalculationError.invalidCoordinates
        }

        var parameters = settings.calculationMethod.adhanMethod.params
        parameters.madhab = settings.madhab.adhanMadhab

        let day = calendar.dateComponents([.year, .month, .day], from: date)
        let adhanCoordinates = Coordinates(
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        )

        guard let prayerTimes = PrayerTimes(
            coordinates: adhanCoordinates,
            date: day,
            calculationParameters: parameters
        ) else {
            throw PrayerCalculationError.unavailableTimes
        }

        let times = PrayerID.allCases.map { prayer in
            PrayerTime(prayer: prayer, date: prayerTimes.time(for: prayer.adhanPrayer))
        }

        return DailyPrayerSchedule(date: date, times: times)
    }
}

extension Calendar {
    public static var gregorianUTC: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }
}
