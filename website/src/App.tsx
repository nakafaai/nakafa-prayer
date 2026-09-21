import { useDisclosure } from '@mantine/hooks'
import { TriangleAlert } from 'lucide-react'
import { LocationPanel } from './components/location-panel'
import { NextPrayerHero } from './components/next-prayer-hero'
import { PrayerList } from './components/prayer-list'
import { usePrayerSchedule } from './components/prayer-context'
import { PrayerProviders } from './components/prayer-provider'
import { SettingsDialog } from './components/settings-dialog'
import { SiteFooter } from './components/site-footer'
import { SiteHeader } from './components/site-header'
import { Panel } from './components/ui/panel'
import { TooltipProvider } from './components/ui/tooltip'
import { WeekTable } from './components/week-table'
import { MESSAGES } from './lib/i18n'

function UnavailableNotice() {
  const { state } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2">
        <TriangleAlert aria-hidden="true" className="size-4 text-warning" />
        <h2 className="text-sm font-semibold tracking-tight">{t.unavailableTitle}</h2>
      </div>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">{t.unavailableBody}</p>
    </Panel>
  )
}

function SiteShell() {
  const { state } = usePrayerSchedule()
  const [settingsOpened, settings] = useDisclosure(false)

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader resolvedTheme={state.resolvedTheme} onOpenSettings={settings.open} />

        <main className="flex-1">
          <NextPrayerHero />

          <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
              {state.unavailable ? <UnavailableNotice /> : <PrayerList />}
              <LocationPanel onChangeLocation={settings.open} />
            </div>

            {state.unavailable ? null : (
              <div className="mt-6">
                <WeekTable />
              </div>
            )}
          </div>
        </main>

        <SiteFooter />
        <SettingsDialog opened={settingsOpened} onClose={settings.close} />
      </div>
    </TooltipProvider>
  )
}

export function App() {
  return (
    <PrayerProviders>
      <SiteShell />
    </PrayerProviders>
  )
}
