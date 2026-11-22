import { Array as Arr, DateTime, Match, Option } from 'effect'
import type { LanguageId } from './i18n'
import type { PrayerSettings } from './settings-schema'

export const SETTINGS_STORAGE_KEY = 'nakafa-prayer.settings.v1'
export const THEME_STORAGE_KEY = 'nakafa-prayer.theme'

/** BCP-47 locale used for every number, date and time format. */
export function resolveLocale(language: LanguageId): string {
  return language === 'id' ? 'id-ID' : 'en-US'
}

/** Reads the visitor's preferred language, defaulting to English. */
export function detectLanguage(): LanguageId {
  const preferred = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [])

  return Option.match(
    Arr.findFirst(preferred, (candidate) => candidate.toLowerCase().startsWith('id')),
    {
      onNone: () => 'en' as const,
      onSome: () => 'id' as const,
    },
  )
}

const LOCALE_HOUR_12: Readonly<Record<string, boolean>> = {
  'en-US': new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).resolvedOptions().hour12 ?? false,
  'id-ID': new Intl.DateTimeFormat('id-ID', { hour: 'numeric' }).resolvedOptions().hour12 ?? false,
}

/** Resolves the 12/24-hour preference, following the locale when unset. */
export function resolveHour12(timeFormat: PrayerSettings['timeFormat'], locale: string): boolean {
  return Match.value(timeFormat).pipe(
    Match.when('h12', () => true),
    Match.when('h24', () => false),
    Match.when('system', () => LOCALE_HOUR_12[locale] ?? false),
    Match.exhaustive,
  )
}

export function createDefaultSettings(): PrayerSettings {
  return {
    language: detectLanguage(),
    calculationMethod: 'muslimWorldLeague',
    madhab: 'shafi',
    timeFormat: 'system',
    location: null,
  }
}

/** True when `Intl` accepts the identifier, so a stored zone cannot break formatting. */
export function isValidTimeZone(timeZone: string): boolean {
  return Option.isSome(DateTime.zoneMakeNamed(timeZone))
}

/** Drops a stored location whose time zone the runtime no longer supports. */
export function withUsableLocation(settings: PrayerSettings): PrayerSettings {
  const location = settings.location

  if (!location || isValidTimeZone(location.timeZone)) {
    return settings
  }

  return { ...settings, location: null }
}
