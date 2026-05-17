import Foundation

public struct NextPrayerResolver: Sendable {
    private let calculator: PrayerCalculator
    private let calendar: Calendar

    public init(
        calculator: PrayerCalculator = PrayerCalculator(),
        calendar: Calendar = .gregorianUTC
    ) {
        self.calculator = calculator
        self.calendar = calendar
    }

    public func nextPrayer(
        after now: Date,
        coordinates: PrayerCoordinates,
        settings: PrayerSettings
    ) throws -> PrayerTime {
        let today = try calculator.schedule(
            for: now,
            coordinates: coordinates,
            settings: settings
        )

        if let next = today.nextPrayer(after: now) {
            return next
        }

        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let schedule = try calculator.schedule(
            for: tomorrow,
            coordinates: coordinates,
            settings: settings
        )

        guard let next = schedule.times.first else {
            throw PrayerCalculationError.unavailableTimes
        }

        return next
    }
}
