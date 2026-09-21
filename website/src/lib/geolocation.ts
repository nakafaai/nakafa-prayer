import { Data, Effect } from 'effect'

export type DeviceCoordinates = { latitude: number; longitude: number }

/** The visitor refused the permission prompt. */
export class LocationDenied extends Data.TaggedError('LocationDenied')<{
  readonly reason: 'permission-denied'
}> {}

/** The browser could not produce a position this time. */
export class LocationUnavailable extends Data.TaggedError('LocationUnavailable')<{
  readonly reason: 'position-unavailable'
}> {}

/** The browser has no Geolocation API at all. */
export class LocationUnsupported extends Data.TaggedError('LocationUnsupported')<{
  readonly reason: 'no-geolocation-api'
}> {}

export type LocationError = LocationDenied | LocationUnavailable | LocationUnsupported

/**
 * Requests one position from the browser.
 *
 * The failure is a typed value, not an exception, so the page can tell the
 * visitor what to do next instead of quietly keeping stale coordinates.
 */
export function requestPosition(): Effect.Effect<DeviceCoordinates, LocationError> {
  return Effect.suspend(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return Effect.fail(new LocationUnsupported({ reason: 'no-geolocation-api' }))
    }

    return Effect.gen(function* () {
      const position = yield* Effect.callback<GeolocationPosition, LocationError>((resume) => {
        navigator.geolocation.getCurrentPosition(
          (result) => resume(Effect.succeed(result)),
          (error) =>
            resume(
              Effect.fail(
                error.code === error.PERMISSION_DENIED
                  ? new LocationDenied({ reason: 'permission-denied' })
                  : new LocationUnavailable({ reason: 'position-unavailable' }),
              ),
            ),
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
        )
      })

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    })
  })
}
