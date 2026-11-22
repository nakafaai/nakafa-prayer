import { Array as Arr, DateTime, MutableHashMap, Option, Schema } from 'effect'
import type { CivilDate, GeoPoint } from './prayer'

export const ClockOptionsSchema = Schema.Struct({
  timeZone: Schema.String,
  locale: Schema.String,
  hour12: Schema.Boolean,
})
export type ClockOptions = typeof ClockOptionsSchema.Type

const clockFormatters = MutableHashMap.empty<string, Intl.DateTimeFormat>()

/** Formats a prayer time on the location's own clock. */
export function formatClock(instant: Date, { timeZone, locale, hour12 }: ClockOptions): string {
  const key = `${locale}|${timeZone}|${hour12}`
  const cached = MutableHashMap.get(clockFormatters, key)
  if (Option.isSome(cached)) {
    return cached.value.format(instant)
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  })
  MutableHashMap.set(clockFormatters, key, formatter)
  return formatter.format(instant)
}

/** A calendar day anchored in UTC, so every formatter reads the same date. */
function utcAnchor(date: CivilDate): Date {
  return DateTime.toDateUtc(
    DateTime.makeUnsafe({ year: date.year, month: date.month, day: date.day }),
  )
}

const calendarFormatters = MutableHashMap.empty<string, Intl.DateTimeFormat>()

function calendarFormatter(
  locale: string,
  keySuffix: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${keySuffix}`
  const cached = MutableHashMap.get(calendarFormatters, key)
  if (Option.isSome(cached)) {
    return cached.value
  }

  const formatter = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options })
  MutableHashMap.set(calendarFormatters, key, formatter)
  return formatter
}

/** Weekday name for a calendar day. */
export function formatWeekday(
  date: CivilDate,
  locale: string,
  width: 'narrow' | 'short' | 'long' = 'short',
): string {
  return calendarFormatter(locale, `weekday:${width}`, { weekday: width }).format(utcAnchor(date))
}

/** Full Gregorian date, for example `Sunday, 21 September 2026`. */
export function formatFullDate(date: CivilDate, locale: string): string {
  return calendarFormatter(locale, 'full', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utcAnchor(date))
}

/** Short day and month, for example `21 Sep`. */
export function formatDayMonth(date: CivilDate, locale: string): string {
  return calendarFormatter(locale, 'day-month', { day: 'numeric', month: 'short' }).format(
    utcAnchor(date),
  )
}

/** Hijri date on the Umm al-Qura calendar, matching the app's convention. */
export function formatHijriDate(date: CivilDate, locale: string): string {
  return calendarFormatter(`${locale}-u-ca-islamic-umalqura`, 'hijri', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(utcAnchor(date))
}

const numberFormatters = MutableHashMap.empty<string, Intl.NumberFormat>()

function numberFormatter(
  locale: string,
  keySuffix: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}|${keySuffix}`
  const cached = MutableHashMap.get(numberFormatters, key)
  if (Option.isSome(cached)) {
    return cached.value
  }

  const formatter = new Intl.NumberFormat(locale, options)
  MutableHashMap.set(numberFormatters, key, formatter)
  return formatter
}

/** Signed decimal degrees, for example `52.52° N, 13.41° E`. */
export function formatCoordinates(point: GeoPoint, locale: string): string {
  const decimal = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  const formatter = numberFormatter(locale, 'coords:2', decimal)
  const latitude = formatter.format(Math.abs(point.latitude))
  const longitude = formatter.format(Math.abs(point.longitude))
  const latitudeHemisphere = point.latitude >= 0 ? 'N' : 'S'
  const longitudeHemisphere = point.longitude >= 0 ? 'E' : 'W'

  return `${latitude}° ${latitudeHemisphere}, ${longitude}° ${longitudeHemisphere}`
}

/** Whole degrees towards the Kaaba, for example `137°`. */
export function formatBearing(degrees: number, locale: string): string {
  return `${numberFormatter(locale, 'bearing:0', { maximumFractionDigits: 0 }).format(degrees)}°`
}

export const CountdownPartsSchema = Schema.Struct({
  hours: Schema.Finite,
  minutes: Schema.Finite,
  seconds: Schema.Finite,
})
export type CountdownParts = typeof CountdownPartsSchema.Type

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
  return Arr.join(
    Arr.map([hours, minutes, seconds], (value) => String(value).padStart(2, '0')),
    ':',
  )
}
