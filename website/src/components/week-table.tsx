import { formatClock, formatDayMonth, formatWeekday } from '@/lib/format'
import { MESSAGES, PRAYER_NAMES } from '@/lib/i18n'
import { PRAYER_IDS, civilDateKey } from '@/lib/prayer'
import { cn } from '@/lib/utils'
import { usePrayerSchedule } from './prayer-context'
import { Panel, PanelHeader } from './ui/panel'

const headingClass =
  'px-3 py-2.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase'

/** Seven day timetable, scrollable sideways on narrow screens. */
export function WeekTable() {
  const { state } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const names = PRAYER_NAMES[state.settings.language]

  if (state.week.length === 0) {
    return null
  }

  return (
    <Panel className="overflow-hidden bg-background">
      <PanelHeader>
        <h2 className="text-sm font-semibold tracking-tight">{t.weekSchedule}</h2>
      </PanelHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="bg-background">
              <th
                scope="col"
                className={cn(headingClass, 'sticky start-0 bg-inherit px-4 text-start sm:px-5')}
              >
                {t.dayColumn}
              </th>
              {PRAYER_IDS.map((id) => (
                <th key={id} scope="col" className={cn(headingClass, 'text-end')}>
                  {names[id]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {state.week.map((day) => {
              const key = civilDateKey(day.date)
              const isToday = key === state.todayKey

              return (
                <tr key={key} className={cn('bg-background', isToday && 'bg-muted')}>
                  <th
                    scope="row"
                    className="sticky start-0 bg-inherit px-4 py-3 text-start font-medium whitespace-nowrap sm:px-5"
                  >
                    <span>{formatWeekday(day.date, state.locale, 'short')}</span>
                    <span className="ms-2 font-normal text-muted-foreground tabular-nums">
                      {formatDayMonth(day.date, state.locale)}
                    </span>
                  </th>

                  {day.prayers.map((prayer) => (
                    <td
                      key={prayer.id}
                      className={cn(
                        'px-3 py-3 text-end tabular-nums',
                        isToday ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {formatClock(prayer.instant, state.clock)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
