import { MapPin, Moon, Settings, Sun } from 'lucide-react'
import { MESSAGES } from '@/lib/i18n'
import { BrandMark } from './brand-mark'
import { usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

/** Sticky chrome: brand, current location, theme toggle and settings. */
export function SiteHeader({
  resolvedTheme,
  onOpenSettings,
}: {
  resolvedTheme: 'light' | 'dark'
  onOpenSettings: () => void
}) {
  const { state, actions } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const isDark = resolvedTheme === 'dark'
  const themeAction = isDark ? t.switchToLight : t.switchToDark

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark />
          <span className="truncate text-[15px] font-semibold tracking-tight">{t.brand}</span>
        </div>

        <div className="ms-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="hidden max-w-56 text-muted-foreground sm:inline-flex"
          >
            <MapPin aria-hidden="true" />
            <span className="min-w-0 truncate">{state.locationLabel}</span>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={themeAction}
                onClick={() => actions.setTheme(isDark ? 'light' : 'dark')}
              >
                {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{themeAction}</TooltipContent>
          </Tooltip>

          <Button variant="ghost" size="icon-sm" aria-label={t.settings} onClick={onOpenSettings}>
            <Settings aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
