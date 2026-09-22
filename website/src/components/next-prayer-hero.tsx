import { MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatClock, formatFullDate, formatHijriDate } from '@/lib/format'
import { MESSAGES, PRAYER_NAMES } from '@/lib/i18n'
import { civilDateIn, civilDateKey } from '@/lib/prayer'
import { DayClock } from './clock/day-clock'
import { usePrayerClock, usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'

/**
 * Counts the times the upcoming prayer changes after the first render.
 *
 * The hero re-mounts its headline on each change so the crossfade replays, and
 * stays still on load.
 */
function usePrayerSwaps(prayerId: string | undefined): number {
  const [swaps, setSwaps] = useState(0)
  const previous = useRef(prayerId)

  useEffect(() => {
    if (previous.current === prayerId) {
      return
    }

    previous.current = prayerId
    setSwaps((value) => value + 1)
  }, [prayerId])

  return swaps
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  )
}

export function NextPrayerHero() {
  const { state, actions } = usePrayerSchedule()
  const { window } = usePrayerClock()
  const t = MESSAGES[state.settings.language]
  const names = PRAYER_NAMES[state.settings.language]

  const next = window?.next ?? null
  const swaps = usePrayerSwaps(next?.id)
  const nextIsTomorrow =
    next !== null &&
    civilDateKey(civilDateIn(next.instant, state.location.timeZone)) !== state.todayKey

  const locationMessage =
    state.locationStatus === 'denied'
      ? t.locationDenied
      : state.locationStatus === 'unavailable'
        ? t.locationUnavailable
        : state.locationStatus === 'unsupported'
          ? t.locationUnsupported
          : null

  return (
    <section className="border-b border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {t.prayerTimesFor} {state.location.label}
          </h1>

          {state.unavailable ? (
            <p className="mt-6 max-w-md text-sm text-pretty text-muted-foreground">
              {t.unavailableBody}
            </p>
          ) : (
            <div key={swaps} className={swaps > 0 ? 'prayer-swap' : undefined}>
              <p className="mt-8 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {t.nextPrayer}
              </p>
              <p className="mt-2 text-[clamp(2.5rem,9vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance">
                {next ? names[next.id] : '--'}
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-2xl font-medium tabular-nums text-muted-foreground sm:text-3xl">
                <span>{next ? formatClock(next.instant, state.clock) : '--:--'}</span>
                {nextIsTomorrow ? (
                  <span className="text-sm font-normal tracking-normal">{t.tomorrow}</span>
                ) : null}
              </p>
            </div>
          )}

          <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <MetaItem
              label={t.gregorianDate}
              value={formatFullDate(state.today, state.locale)}
            />
            <MetaItem label={t.hijriDate} value={formatHijriDate(state.today, state.locale)} />
          </dl>

          {state.location.approximate ? (
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <p className="max-w-md text-sm text-pretty text-muted-foreground">
                {t.locationApproximateHint}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={actions.requestDeviceLocation}
                disabled={state.locationStatus === 'requesting'}
              >
                <MapPin aria-hidden="true" />
                {state.locationStatus === 'requesting' ? t.locating : t.useMyLocation}
              </Button>
            </div>
          ) : null}

          {locationMessage ? (
            <p className="mt-4 max-w-md text-sm text-muted-foreground">{locationMessage}</p>
          ) : null}
        </div>

        <div className="w-full max-w-72 lg:justify-self-end">
          <DayClock />
        </div>
      </div>
    </section>
  )
}
