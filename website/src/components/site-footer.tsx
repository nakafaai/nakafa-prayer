import { Download, ShieldCheck } from 'lucide-react'
import { MESSAGES } from '@/lib/i18n'
import { usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'
import { Panel } from './ui/panel'

const REPOSITORY_URL = 'https://github.com/nakafaai/nakafa-prayer'
const RELEASES_URL = `${REPOSITORY_URL}/releases/latest`

export function SiteFooter() {
  const { state } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">{t.privacyTitle}</h2>
          </div>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{t.privacyBody}</p>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <Download aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">{t.appTitle}</h2>
          </div>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{t.appBody}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <a href={RELEASES_URL} target="_blank" rel="noreferrer">
              <Download aria-hidden="true" />
              {t.appCta}
            </a>
          </Button>
        </Panel>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>{t.footerNote}</span>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            className="ms-auto rounded-sm transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {t.sourceCta}
          </a>
        </div>
      </div>
    </footer>
  )
}
