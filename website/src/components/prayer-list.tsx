import { formatClock, formatDayMonth } from '@/lib/format'
import { MESSAGES, PRAYER_NAMES } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { usePrayerClock, usePrayerSchedule } from './prayer-context'
import { Badge } from './ui/badge'
import { Panel, PanelHeader } from './ui/panel'

/** Today's five prayers, with the interval in progress and the next one marked. */
export function PrayerList() {
  const { state } = usePrayerSchedule()
  const { window } = usePrayerClock()
  const t = MESSAGES[state.settings.language]
  const names = PRAYER_NAMES[state.settings.language]
  const today = state.week[0]

  if (!today) {
    return null
  }

  return (
    <Panel className="overflow-hidden">
      <PanelHeader>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold tracking-tight">{t.todaySchedule}</h2>
          <span className="text-sm text-muted-foreground">
            {formatDayMonth(today.date, state.locale)}
          </span>
        </div>
      </PanelHeader>

      <ul className="divide-y divide-border">
        {today.prayers.map((prayer) => {
          // Compare instants, not ids: after Isha the next prayer is tomorrow's
          // Fajr, and today's Fajr row must not claim it.
          const isNext = prayer.instant.getTime() === window?.next.instant.getTime()
          const isCurrent = !isNext && prayer.instant.getTime() === window?.previous.instant.getTime()
          const isDimmed = !isNext && !isCurrent

          return (
            <li
              key={prayer.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 sm:px-5',
                isNext && 'bg-muted',
                isCurrent && 'bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-[15px]',
                  isDimmed && 'text-muted-foreground',
                  isCurrent && 'font-medium',
                  isNext && 'font-semibold',
                )}
              >
                {names[prayer.id]}
              </span>

              <span
                className={cn(
                  'text-[15px] tabular-nums',
                  isDimmed && 'text-muted-foreground',
                  isCurrent && 'font-medium',
                  isNext && 'font-semibold',
                )}
              >
                {formatClock(prayer.instant, state.clock)}
              </span>

              <span className="flex w-[5.5rem] shrink-0 justify-end">
                {isNext ? <Badge tone="primary">{t.statusNext}</Badge> : null}
                {isCurrent ? <Badge>{t.statusCurrent}</Badge> : null}
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
