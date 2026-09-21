import type { CivilDate, GeoPoint } from './prayer'

export type ClockOptions = { timeZone: string; locale: string; hour12: boolean }

const clockFormatters = new Map<string, Intl.DateTimeFormat>()

/** Formats a prayer time on the location's own clock. */
export function formatClock(instant: Date, { timeZone, locale, hour12 }: ClockOptions): string {
  const key = `${locale}|${timeZone}|${hour12}`
  let formatter = clockFormatters.get(key)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12,
    })
    clockFormatters.set(key, formatter)
  }

  return formatter.format(instant)
}

/** A calendar day anchored in UTC, so every formatter reads the same date. */
function utcAnchor(date: CivilDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day))
}

const calendarFormatters = new Map<string, Intl.DateTimeFormat>()

function calendarFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = calendarFormatters.get(key)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options })
    calendarFormatters.set(key, formatter)
  }

  return formatter
}

/** Weekday name for a calendar day. */
export function formatWeekday(
  date: CivilDate,
  locale: string,
  width: 'narrow' | 'short' | 'long' = 'short',
): string {
  return calendarFormatter(locale, { weekday: width }).format(utcAnchor(date))
}

/** Full Gregorian date, for example `Sunday, 21 September 2026`. */
export function formatFullDate(date: CivilDate, locale: string): string {
  return calendarFormatter(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utcAnchor(date))
}

/** Short day and month, for example `21 Sep`. */
export function formatDayMonth(date: CivilDate, locale: string): string {
  return calendarFormatter(locale, { day: 'numeric', month: 'short' }).format(utcAnchor(date))
}

/** Hijri date on the Umm al-Qura calendar, matching the app's convention. */
export function formatHijriDate(date: CivilDate, locale: string): string {
  return calendarFormatter(`${locale}-u-ca-islamic-umalqura`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utcAnchor(date))
}

const numberFormatters = new Map<string, Intl.NumberFormat>()

function numberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = numberFormatters.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    numberFormatters.set(key, formatter)
  }

  return formatter
}

/** Signed decimal degrees, for example `52.52° N, 13.41° E`. */
export function formatCoordinates(point: GeoPoint, locale: string): string {
  const decimal = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  const latitude = numberFormatter(locale, decimal).format(Math.abs(point.latitude))
  const longitude = numberFormatter(locale, decimal).format(Math.abs(point.longitude))
  const latitudeHemisphere = point.latitude >= 0 ? 'N' : 'S'
  const longitudeHemisphere = point.longitude >= 0 ? 'E' : 'W'

  return `${latitude}° ${latitudeHemisphere}, ${longitude}° ${longitudeHemisphere}`
}

/** Whole degrees towards the Kaaba, for example `137°`. */
export function formatBearing(degrees: number, locale: string): string {
  return `${numberFormatter(locale, { maximumFractionDigits: 0 }).format(degrees)}°`
}

export type CountdownParts = { hours: number; minutes: number; seconds: number }

/** Splits a duration into clock parts. */
export function countdownParts(milliseconds: number): CountdownParts {
  const total = Math.max(Math.floor(milliseconds / 1000), 0)
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

/** Countdown as `02:14:36`. */
export function formatCountdownClock(milliseconds: number): string {
  const { hours, minutes, seconds } = countdownParts(milliseconds)
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}
