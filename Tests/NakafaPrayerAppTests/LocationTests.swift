import CoreLocation
import Foundation
import NakafaPrayerCore
import XCTest

@testable import NakafaPrayerApp

final class LocationTests: XCTestCase {
  func testAuthorizationPolicyPromptsOnlyAfterUserAction() {
    let policy = LocationAuthorizationPolicy()

    XCTAssertEqual(
      policy.action(for: .notDetermined, userInitiated: false),
      .none
    )
    XCTAssertEqual(
      policy.action(for: .notDetermined, userInitiated: true),
      .requestPermission
    )
    XCTAssertEqual(
      policy.action(for: .authorized, userInitiated: false),
      .requestLocation
    )
    XCTAssertEqual(
      policy.action(for: .denied, userInitiated: true),
      .reportDenied
    )
    XCTAssertEqual(
      policy.action(for: .restricted, userInitiated: true),
      .reportRestricted
    )
  }

  func testManualParserRequiresAValidPairAndSupportsLocalizedDecimalSeparators() {
    let parser = ManualLocationParser()

    XCTAssertEqual(
      parser.coordinates(
        latitude: "-6,200000",
        longitude: "106,816666",
        locale: Locale(identifier: "id_ID")
      ),
      PrayerCoordinates(latitude: -6.2, longitude: 106.816666)
    )
    XCTAssertNil(
      parser.coordinates(
        latitude: "-6.2",
        longitude: "",
        locale: Locale(identifier: "en_US")
      )
    )
    XCTAssertNil(
      parser.coordinates(
        latitude: "91",
        longitude: "10",
        locale: Locale(identifier: "en_US")
      )
    )
  }

  func testLocationCacheRoundTripRejectsInvalidCoordinates() throws {
    let suiteName = "LocationTests.\(UUID().uuidString)"
    let defaults = try XCTUnwrap(UserDefaults(suiteName: suiteName))
    defer { defaults.removePersistentDomain(forName: suiteName) }

    let cache = LocationCache(defaults: defaults)
    let snapshot = LocationSnapshot(
      coordinates: PrayerCoordinates(latitude: -6.2, longitude: 106.8),
      capturedAt: Date(timeIntervalSince1970: 123)
    )

    XCTAssertTrue(cache.save(snapshot))
    XCTAssertEqual(cache.load(), snapshot)
    XCTAssertFalse(
      cache.save(
        LocationSnapshot(
          coordinates: PrayerCoordinates(latitude: 100, longitude: 106.8),
          capturedAt: Date()
        )
      )
    )
  }
}
