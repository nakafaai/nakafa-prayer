import Foundation
import XCTest

@testable import NakafaPrayerCore

final class SettingsStoreTests: XCTestCase {
  func testRoundTripCurrentSettings() throws {
    let defaults = makeDefaults()
    let store = SettingsStore(defaults: defaults)
    var settings = PrayerSettings()
    settings.language = .indonesian
    settings.focusDurationMinutes = 12
    settings.locationMode = .manual
    settings.manualCoordinates = PrayerCoordinates(latitude: -6.2, longitude: 106.8)
    settings.manualLocationLabel = "Jakarta"

    XCTAssertTrue(store.save(settings))

    let result = store.load()
    XCTAssertEqual(result.settings, settings)
    XCTAssertEqual(result.recovery, .none)
    XCTAssertNil(result.migratedAutomaticCoordinates)

    let encoded = try XCTUnwrap(defaults.data(forKey: settingsKey))
    let object = try XCTUnwrap(JSONSerialization.jsonObject(with: encoded) as? [String: Any])
    XCTAssertEqual(object["schemaVersion"] as? Int, PrayerSettings.currentSchemaVersion)
    XCTAssertNil(object["adhanVoice"])
    XCTAssertNil(object["lastKnownPlaceName"])
  }

  func testLegacyAutomaticSettingsMigrateSafely() throws {
    let defaults = makeDefaults()
    try setLegacySettings(
      [
        "language": "id",
        "calculationMethod": "singapore",
        "madhab": "hanafi",
        "lockDurationMinutes": 20,
        "launchAtLogin": true,
        "adhanEnabled": true,
        "adhanVoice": "af79859edca6",
        "useManualCoordinates": false,
        "manualCoordinates": ["latitude": -6.2, "longitude": 106.816666],
        "lastKnownCoordinates": ["latitude": 52.52, "longitude": 13.405],
        "lastKnownPlaceName": "Berlin, Germany",
      ],
      defaults: defaults
    )

    let result = SettingsStore(defaults: defaults).load()

    XCTAssertEqual(result.settings.language, .indonesian)
    XCTAssertEqual(result.settings.calculationMethod, .singapore)
    XCTAssertEqual(result.settings.madhab, .hanafi)
    XCTAssertEqual(result.settings.focusDurationMinutes, 20)
    XCTAssertEqual(result.settings.reminderMode, .notification)
    XCTAssertEqual(result.settings.focusConsentVersion, 0)
    XCTAssertEqual(result.settings.locationMode, .automatic)
    XCTAssertNil(result.settings.manualCoordinates)
    XCTAssertNil(result.settings.manualLocationLabel)
    XCTAssertEqual(
      result.migratedAutomaticCoordinates,
      PrayerCoordinates(latitude: 52.52, longitude: 13.405)
    )
  }

  func testExplicitSchemaOnePreservesCachedAutomaticCoordinates() throws {
    let defaults = makeDefaults()
    try setLegacySettings(
      [
        "schemaVersion": 1,
        "useManualCoordinates": false,
        "lastKnownCoordinates": ["latitude": 52.52, "longitude": 13.405],
      ],
      defaults: defaults
    )

    let result = SettingsStore(defaults: defaults).load()

    XCTAssertEqual(result.settings.locationMode, .automatic)
    XCTAssertEqual(
      result.migratedAutomaticCoordinates,
      PrayerCoordinates(latitude: 52.52, longitude: 13.405)
    )
  }

  func testLegacyManualSettingsPreserveOnlyExplicitValidCoordinates() throws {
    let defaults = makeDefaults()
    try setLegacySettings(
      [
        "useManualCoordinates": true,
        "manualCoordinates": ["latitude": -7.25, "longitude": 112.75],
        "manualPlaceName": "Surabaya",
      ],
      defaults: defaults
    )

    let settings = SettingsStore(defaults: defaults).load().settings

    XCTAssertEqual(settings.locationMode, .manual)
    XCTAssertEqual(
      settings.manualCoordinates,
      PrayerCoordinates(latitude: -7.25, longitude: 112.75)
    )
    XCTAssertNil(settings.manualLocationLabel)
  }

  func testCurrentFocusModeRequiresCurrentConsent() throws {
    let data = try JSONSerialization.data(
      withJSONObject: [
        "schemaVersion": PrayerSettings.currentSchemaVersion,
        "reminderMode": "focus",
        "focusConsentVersion": 0,
      ]
    )

    let settings = try JSONDecoder().decode(PrayerSettings.self, from: data)

    XCTAssertEqual(settings.reminderMode, .notification)
    XCTAssertFalse(settings.isFocusModeEnabled)
  }

  func testCurrentFocusModePreservesCurrentConsent() throws {
    let data = try JSONSerialization.data(
      withJSONObject: [
        "schemaVersion": PrayerSettings.currentSchemaVersion,
        "reminderMode": "focus",
        "focusConsentVersion": PrayerSettings.currentFocusConsentVersion,
      ]
    )

    let settings = try JSONDecoder().decode(PrayerSettings.self, from: data)

    XCTAssertEqual(settings.reminderMode, .focus)
    XCTAssertTrue(settings.isFocusModeEnabled)
  }

  func testLegacyInvalidManualCoordinatesAreDiscarded() throws {
    let defaults = makeDefaults()
    try setLegacySettings(
      [
        "useManualCoordinates": true,
        "manualCoordinates": ["latitude": 120, "longitude": 200],
      ],
      defaults: defaults
    )

    let settings = SettingsStore(defaults: defaults).load().settings

    XCTAssertEqual(settings.locationMode, .manual)
    XCTAssertNil(settings.manualCoordinates)
    XCTAssertEqual(settings.reminderMode, .notification)
  }

  func testCorruptSettingsReportRecovery() {
    let defaults = makeDefaults()
    defaults.set(Data("not-json".utf8), forKey: settingsKey)

    let result = SettingsStore(defaults: defaults).load()

    XCTAssertEqual(result.settings, PrayerSettings())
    XCTAssertEqual(result.recovery, .resetCorruptData)
  }

  private let settingsKey = "ai.nakafa.prayer.settings"

  private func makeDefaults() -> UserDefaults {
    let suite = "ai.nakafa.prayer.tests.\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suite)!
    defaults.removePersistentDomain(forName: suite)
    return defaults
  }

  private func setLegacySettings(_ object: [String: Any], defaults: UserDefaults) throws {
    defaults.set(try JSONSerialization.data(withJSONObject: object), forKey: settingsKey)
  }
}
