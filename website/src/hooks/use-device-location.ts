import { Effect, Schema } from 'effect'
import { useCallback, useState } from 'react'
import { requestPosition, type DeviceCoordinates } from '@/lib/geolocation'

export const LocationStatusSchema = Schema.Literals([
  'idle',
  'requesting',
  'denied',
  'unavailable',
  'unsupported',
])

export type LocationStatus = typeof LocationStatusSchema.Type

/**
 * Runs the geolocation effect and reports the outcome as page state.
 *
 * Every typed failure maps to one status, so the UI never has to inspect an
 * error object to decide what to say.
 */
export function useDeviceLocation() {
  const [status, setStatus] = useState<LocationStatus>('idle')

  const request = useCallback((onSuccess: (coordinates: DeviceCoordinates) => void) => {
    setStatus('requesting')

    const program = requestPosition.pipe(
      Effect.tap((coordinates) =>
        Effect.sync(() => {
          setStatus('idle')
          onSuccess(coordinates)
        }),
      ),
      Effect.catchTags({
        LocationDenied: () => Effect.sync(() => setStatus('denied')),
        LocationUnavailable: () => Effect.sync(() => setStatus('unavailable')),
        LocationUnsupported: () => Effect.sync(() => setStatus('unsupported')),
      }),
    )

    void Effect.runPromise(program)
  }, [])

  return { status, request }
}
