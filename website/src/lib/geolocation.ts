import { Effect, Schema } from 'effect'

export const DeviceCoordinatesSchema = Schema.Struct({
  latitude: Schema.Finite,
  longitude: Schema.Finite,
})

export type DeviceCoordinates = typeof DeviceCoordinatesSchema.Type

/** The visitor refused the permission prompt. */
export class LocationDenied extends Schema.TaggedError<
  LocationDenied,
  { readonly brand: unique symbol }
>()('LocationDenied', {
  reason: Schema.Literal('permission-denied'),
}) {}

/** The browser could not produce a position this time. */
export class LocationUnavailable extends Schema.TaggedError<
  LocationUnavailable,
  { readonly brand: unique symbol }
>()('LocationUnavailable', {
  reason: Schema.Literal('position-unavailable'),
}) {}

/** The browser has no Geolocation API at all. */
export class LocationUnsupported extends Schema.TaggedError<
  LocationUnsupported,
  { readonly brand: unique symbol }
>()('LocationUnsupported', {
  reason: Schema.Literal('no-geolocation-api'),
}) {}

export const LocationErrorSchema = Schema.Union([
  LocationDenied,
  LocationUnavailable,
  LocationUnsupported,
])

export type LocationError = typeof LocationErrorSchema.Type

/**
 * Requests one position from the browser.
 *
 * The failure is a typed value, not an exception, so the page can tell the
 * visitor what to do next instead of quietly keeping stale coordinates.
 */
export const requestPosition: Effect.Effect<DeviceCoordinates, LocationError> = Effect.suspend(
  () => {
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
  },
)
