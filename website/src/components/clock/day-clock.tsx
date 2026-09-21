import { useReducedMotion } from '@mantine/hooks'
import { lazy, Suspense, useState } from 'react'
import { formatCountdownClock } from '@/lib/format'
import { MESSAGES } from '@/lib/i18n'
import { dayFraction } from '@/lib/prayer'
import { usePrayerClock, usePrayerSchedule } from '../prayer-context'
import { DialFlat } from './dial-flat'
import { dayIndex, type DialView } from './dial-view'

// Three.js stays out of the first bundle. The flat dial covers the wait.
const DialScene = lazy(() => import('./dial-scene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * The day dial.
 *
 * The scene is decorative, so it is hidden from assistive technology and the
 * countdown beside it carries the meaning. Reduced motion keeps the 3D dial but
 * drops the sweeping and the pointer parallax.
 */
export function DayClock() {
  const { state } = usePrayerSchedule()
  const { now, window } = usePrayerClock()
  const prefersReducedMotion = useReducedMotion(false, { getInitialValueInEffect: false })
  const [hasWebGL] = useState(supportsWebGL)
  const t = MESSAGES[state.settings.language]

  const { timeZone } = state.location
  const today = state.week[0]
  const markers = (today?.prayers ?? []).map((prayer) => dayFraction(prayer.instant, timeZone))
  const nextIndex =
    today && window
      ? today.prayers.findIndex((prayer) => prayer.instant.getTime() === window.next.instant.getTime())
      : -1

  const view: DialView = {
    dayIndex: dayIndex(state.today),
    fraction: dayFraction(now, timeZone),
    markers,
    nextIndex: nextIndex >= 0 ? nextIndex : null,
  }

  const remaining = window ? window.next.instant.getTime() - now.getTime() : 0

  return (
    <div className="relative mx-auto aspect-square w-full max-w-72">
      <div className="absolute inset-0" aria-hidden="true">
        {hasWebGL ? (
          <Suspense fallback={<DialFlat view={view} clockTime={now} />}>
            <DialScene
              view={view}
              theme={state.resolvedTheme}
              motion={prefersReducedMotion ? 'instant' : 'damped'}
            />
          </Suspense>
        ) : (
          <DialFlat view={view} clockTime={now} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">
          {formatCountdownClock(remaining)}
        </span>
        <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {t.remaining}
        </span>
      </div>
    </div>
  )
}
