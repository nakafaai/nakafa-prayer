import Foundation
import XCTest

@testable import NakafaPrayerApp

final class FocusActivationPolicyTests: XCTestCase {
  func testStartsAtPrayerTimeAndFiveMinuteBoundary() {
    let policy = FocusActivationPolicy()
    let scheduledAt = Date(timeIntervalSince1970: 1_000)

    XCTAssertTrue(policy.shouldStart(scheduledAt: scheduledAt, now: scheduledAt))
    XCTAssertTrue(
      policy.shouldStart(
        scheduledAt: scheduledAt,
        now: scheduledAt.addingTimeInterval(5 * 60)
      )
    )
  }

  func testDoesNotStartEarlyOrMoreThanFiveMinutesLate() {
    let policy = FocusActivationPolicy()
    let scheduledAt = Date(timeIntervalSince1970: 1_000)

    XCTAssertFalse(
      policy.shouldStart(
        scheduledAt: scheduledAt,
        now: scheduledAt.addingTimeInterval(-1)
      )
    )
    XCTAssertFalse(
      policy.shouldStart(
        scheduledAt: scheduledAt,
        now: scheduledAt.addingTimeInterval((5 * 60) + 0.001)
      )
    )
  }
}
