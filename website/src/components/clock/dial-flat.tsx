import { formatClock } from '@/lib/format'
import { MESSAGES } from '@/lib/i18n'
import { usePrayerSchedule } from '../prayer-context'
import type { DialView } from './dial-view'

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
  const today = state.week[0]

  const arcStart = view.nextIndex === null ? 0 : (view.markers[view.nextIndex - 1] ?? 0)
  const nowPoint = pointAt(view.fraction, RADIUS)
  const previousPoint = pointAt(arcStart, RADIUS)
  const largeArc = view.fraction - arcStart > 0.5 ? 1 : 0

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

      {view.markers.map((fraction, index) => {
        const outer = pointAt(fraction, RADIUS)
        const inner = pointAt(fraction, RADIUS - 11)
        const isNext = index === view.nextIndex

        return (
          <line
            key={today?.prayers[index]?.id ?? index}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeWidth={isNext ? 3 : 2}
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
