import { formatClock, formatCountdownClock } from '@/lib/format'
import { MESSAGES } from '@/lib/i18n'
import { civilDateIn, civilDateKey, dayFraction, type CivilDate } from '@/lib/prayer'
import { usePrayerClock, usePrayerSchedule } from './prayer-context'

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 88

function pointAt(fraction: number, radius: number) {
  const angle = fraction * Math.PI * 2 - Math.PI / 2
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

function arcPath(from: number, to: number, radius: number): string {
  const start = pointAt(from, radius)
  const end = pointAt(to, radius)
  const largeArc = to - from > 0.5 ? 1 : 0

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

/**
 * Twenty-four hour dial for the location's day.
 *
 * Prayer ticks mark the day, the arcs measure how much of the day and of the
 * current interval have passed, and the hand sweeps to the current time.
 */
export function DayDial() {
  const { state } = usePrayerSchedule()
  const { now, window } = usePrayerClock()
  const t = MESSAGES[state.settings.language]
  const { timeZone } = state.location

  const nowFraction = dayFraction(now, timeZone)
  // Adding the day index keeps the angle rising forever instead of snapping
  // back to zero at midnight, so the sweep never spins the long way round.
  const handAngle = (dayNumber(state.today) + nowFraction) * 360

  const today = state.week[0]
  const todayKey = today ? civilDateKey(today.date) : null
  const previousIsToday =
    window !== null &&
    todayKey !== null &&
    civilDateKey(civilDateIn(window.previous.instant, timeZone)) === todayKey
  const arcStart = window && previousIsToday ? dayFraction(window.previous.instant, timeZone) : 0
  const remaining = window ? window.next.instant.getTime() - now.getTime() : 0

  return (
    <div className="relative mx-auto aspect-square w-full max-w-72">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 size-full"
        role="img"
        aria-label={`${t.now} ${formatClock(now, state.clock)}`}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-border"
        />

        {nowFraction > 0.001 ? (
          <path
            d={arcPath(0, nowFraction, RADIUS)}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="text-primary/20"
          />
        ) : null}

        {arcStart < nowFraction ? (
          <path
            d={arcPath(arcStart, nowFraction, RADIUS)}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="text-primary"
          />
        ) : null}

        {(today?.prayers ?? []).map((prayer) => {
          const fraction = dayFraction(prayer.instant, timeZone)
          const outer = pointAt(fraction, RADIUS)
          const inner = pointAt(fraction, RADIUS - 11)

          return (
            <line
              key={prayer.id}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="text-muted-foreground"
            />
          )
        })}

        <g
          className="dial-hand"
          style={{
            transform: `rotate(${handAngle}deg)`,
            transformBox: 'view-box',
            transformOrigin: `${CENTER}px ${CENTER}px`,
          }}
        >
          <line
            x1={CENTER}
            y1={CENTER - (RADIUS - 20)}
            x2={CENTER}
            y2={CENTER - (RADIUS + 7)}
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="text-primary"
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
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
/** Reference day that keeps the running angle small and precise. */
const REFERENCE_DAY = Math.floor(Date.UTC(2024, 0, 1) / 86_400_000)

/** Whole days since the reference day, so the angle never wraps backwards. */
function dayNumber(date: CivilDate): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000) - REFERENCE_DAY
}
