import { utcOffsetMinutes } from '@/lib/cities'
import { formatBearing, formatCoordinates } from '@/lib/format'
import { MADHAB_NAMES, MESSAGES, METHOD_NAMES } from '@/lib/i18n'
import { usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'
import { Panel, PanelHeader } from './ui/panel'

function QiblaCompass({ bearing }: { bearing: number }) {
  return (
    <svg viewBox="0 0 48 48" className="size-11 shrink-0" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-border"
      />
      <line
        x1="24"
        y1="3"
        x2="24"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-muted-foreground"
      />
      <g transform={`rotate(${bearing} 24 24)`}>
        <path d="M24 8 L28.5 26 L24 22.5 L19.5 26 Z" fill="currentColor" className="text-primary" />
      </g>
      <circle cx="24" cy="24" r="2" fill="currentColor" className="text-muted-foreground" />
    </svg>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm break-words text-foreground">{value}</dd>
    </div>
  )
}

/** Where the times come from, and the settings that produced them. */
export function LocationPanel({ onChangeLocation }: { onChangeLocation: () => void }) {
  const { state } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const { language } = state.settings

  const offsetMinutes = utcOffsetMinutes(state.location.timeZone, new Date())
  const sign = offsetMinutes < 0 ? '-' : '+'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <PanelHeader>
        <h2 className="text-sm font-semibold tracking-tight">{t.location}</h2>
        <Button variant="outline" size="sm" onClick={onChangeLocation}>
          {t.changeLocation}
        </Button>
      </PanelHeader>

      <dl className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5">
        <Detail label={t.location} value={state.location.label} />
        <Detail
          label={t.timeZone}
          value={`${state.location.timeZone} (UTC${sign}${offsetHours}:${offsetRemainder})`}
        />
        <Detail label={t.coordinates} value={formatCoordinates(state.location, state.locale)} />
        <Detail
          label={t.calculationMethod}
          value={METHOD_NAMES[language][state.settings.calculationMethod]}
        />
        <Detail label={t.asrSchool} value={MADHAB_NAMES[language][state.settings.madhab]} />
      </dl>

      {state.unavailable ? null : (
        <div className="flex items-center gap-4 border-t border-border p-4 sm:p-5">
          <QiblaCompass bearing={state.qibla} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {t.qibla}
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
              {formatBearing(state.qibla, state.locale)}
            </p>
            <p className="text-xs text-muted-foreground">{t.qiblaHint}</p>
          </div>
        </div>
      )}
    </Panel>
  )
}
