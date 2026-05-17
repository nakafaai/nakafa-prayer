import CoreLocation
import Foundation
import NakafaPrayerCore

@MainActor
final class LocationService: NSObject, CLLocationManagerDelegate {
    var onLocation: ((PrayerCoordinates) -> Void)?

    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
    }

    func requestLocation() {
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .authorized, .authorizedAlways:
            manager.requestLocation()
        default:
            return
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.requestLocation()
        }
    }

    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let coordinate = locations.last?.coordinate else {
            return
        }

        Task { @MainActor in
            self.onLocation?(
                PrayerCoordinates(
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude
                )
            )
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {}
}
