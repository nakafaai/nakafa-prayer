import { Effect } from 'effect'
import { useCallback, useState } from 'react'
import { requestPosition, type DeviceCoordinates } from '@/lib/geolocation'

export type LocationStatus = 'idle' | 'requesting' | 'denied' | 'unavailable' | 'unsupported'

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

    const program = requestPosition().pipe(
      Effect.tap((coordinates) =>
        Effect.sync(() => {
          setStatus('idle')
          onSuccess(coordinates)
        }),
      ),
      Effect.catchTag('LocationDenied', () => Effect.sync(() => setStatus('denied'))),
      Effect.catchTag('LocationUnavailable', () => Effect.sync(() => setStatus('unavailable'))),
      Effect.catchTag('LocationUnsupported', () => Effect.sync(() => setStatus('unsupported'))),
    )

    void Effect.runPromise(program)
  }, [])

  return { status, request }
}
