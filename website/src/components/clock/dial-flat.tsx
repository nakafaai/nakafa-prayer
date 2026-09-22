import { formatClock } from '@/lib/format'
import { MESSAGES } from '@/lib/i18n'
import { usePrayerSchedule } from '../prayer-context'
import { HOUR_MARK_COUNT, isMajorHourMark, type DialView } from './dial-view'

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

/**
 * Flat dial, used while the 3D scene loads and wherever WebGL is unavailable.
 *
 * It draws the same day as the 3D variant, so the swap is barely noticeable.
 */
export function DialFlat({ view, clockTime }: { view: DialView; clockTime: Date }) {
  const { state } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]

  const arcStart =
    view.nextIndex === null ? 0 : (view.markers[view.nextIndex - 1]?.fraction ?? 0)
  const nowPoint = pointAt(view.fraction, RADIUS)
  const previousPoint = pointAt(arcStart, RADIUS)
  const largeArc = view.fraction - arcStart > 0.5 ? 1 : 0
  const litMarks = Math.min(HOUR_MARK_COUNT, Math.floor(view.fraction * HOUR_MARK_COUNT) + 1)

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="size-full"
      role="img"
      aria-label={`${t.now} ${formatClock(clockTime, state.clock)}`}
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

      {Array.from({ length: HOUR_MARK_COUNT }, (_, index) => {
        const fraction = index / HOUR_MARK_COUNT
        const length = isMajorHourMark(index) ? 13 : 8
        const outer = pointAt(fraction, RADIUS)
        const inner = pointAt(fraction, RADIUS - length)

        return (
          <line
            key={`hour-${index}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeWidth={isMajorHourMark(index) ? 2 : 1.5}
            strokeLinecap="round"
            className={index < litMarks ? 'text-primary/45' : 'text-muted-foreground/45'}
          />
        )
      })}

      {view.fraction > 0.001 ? (
        <path
          d={`M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${
            view.fraction > 0.5 ? 1 : 0
          } 1 ${nowPoint.x} ${nowPoint.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="text-primary/20"
        />
      ) : null}

      {arcStart < view.fraction ? (
        <path
          d={`M ${previousPoint.x} ${previousPoint.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${nowPoint.x} ${nowPoint.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="text-primary"
        />
      ) : null}

      {view.markers.map((marker, index) => {
        const outer = pointAt(marker.fraction, RADIUS)
        const inner = pointAt(marker.fraction, RADIUS - 22)
        const isNext = index === view.nextIndex

        return (
          <line
            key={marker.id}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeWidth={isNext ? 3.5 : 2.5}
            strokeLinecap="round"
            className={isNext ? 'text-primary' : 'text-muted-foreground'}
          />
        )
      })}

      <line
        x1={CENTER}
        y1={CENTER - (RADIUS - 20)}
        x2={CENTER}
        y2={CENTER - (RADIUS + 7)}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        className="text-primary"
        transform={`rotate(${view.fraction * 360} ${CENTER} ${CENTER})`}
      />
    </svg>
  )
}
