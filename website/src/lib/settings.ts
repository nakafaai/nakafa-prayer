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
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages ?? []

  for (const candidate of preferred) {
    if (candidate.toLowerCase().startsWith('id')) {
      return 'id'
    }
  }

  return 'en'
}

/** Resolves the 12/24-hour preference, following the locale when unset. */
export function resolveHour12(timeFormat: PrayerSettings['timeFormat'], locale: string): boolean {
  if (timeFormat === 'h12') {
    return true
  }

  if (timeFormat === 'h24') {
    return false
  }

  return new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 ?? false
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
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

/** Drops a stored location whose time zone the runtime no longer supports. */
export function withUsableLocation(settings: PrayerSettings): PrayerSettings {
  const location = settings.location

  if (!location || isValidTimeZone(location.timeZone)) {
    return settings
  }

  return { ...settings, location: null }
}
