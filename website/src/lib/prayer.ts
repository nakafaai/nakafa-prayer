import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
  type CalculationParameters,
} from 'adhan'

/** The five wajib prayers the macOS app schedules, in chronological order. */
export const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export type PrayerId = (typeof PRAYER_IDS)[number]

/** Calculation methods shared with the macOS app, keyed by its stable IDs. */
export const CALCULATION_METHOD_IDS = [
  'muslimWorldLeague',
  'egyptian',
  'karachi',
  'ummAlQura',
  'dubai',
  'moonsightingCommittee',
  'northAmerica',
  'kuwait',
  'qatar',
  'singapore',
  'tehran',
  'turkey',
] as const

export type CalculationMethodId = (typeof CALCULATION_METHOD_IDS)[number]

/** Asr shadow-length schools shared with the macOS app. */
export const MADHAB_IDS = ['shafi', 'hanafi'] as const

export type MadhabId = (typeof MADHAB_IDS)[number]

const methodFactories: Record<CalculationMethodId, () => CalculationParameters> = {
  muslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  egyptian: CalculationMethod.Egyptian,
  karachi: CalculationMethod.Karachi,
  ummAlQura: CalculationMethod.UmmAlQura,
  dubai: CalculationMethod.Dubai,
  moonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  northAmerica: CalculationMethod.NorthAmerica,
  kuwait: CalculationMethod.Kuwait,
  qatar: CalculationMethod.Qatar,
  singapore: CalculationMethod.Singapore,
  tehran: CalculationMethod.Tehran,
  turkey: CalculationMethod.Turkey,
}

/** A Gregorian calendar day without a time zone, used as a calculation input. */
export type CivilDate = { year: number; month: number; day: number }

export type GeoPoint = { latitude: number; longitude: number }

export type PrayerInstant = { id: PrayerId; instant: Date }

export type DaySchedule = { date: CivilDate; prayers: PrayerInstant[] }

/** A prayer interval with the elapsed fraction between its two ends. */
export type PrayerWindow = {
  previous: PrayerInstant
  next: PrayerInstant
  progress: number
}

/** Builds adhan parameters for one calculation method and Asr school. */
export function calculationParameters(
  method: CalculationMethodId,
  madhab: MadhabId,
): CalculationParameters {
  const parameters = methodFactories[method]()
  parameters.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return parameters
}

/**
 * Calculates one day of prayer times.
 *
 * `adhan` reads only the year, month and day of the date it is given and
 * returns absolute UTC instants. Building that input day in local time keeps
 * those calendar parts exact; the result is then formatted with the location's
 * own time zone.
 */
export function daySchedule(
  date: CivilDate,
  point: GeoPoint,
  parameters: CalculationParameters,
): DaySchedule {
  const times = new PrayerTimes(
    new Coordinates(point.latitude, point.longitude),
    new Date(date.year, date.month - 1, date.day),
    parameters,
  )

  const prayers = PRAYER_IDS.flatMap((id) => {
    const instant = times.timeForPrayer(id)
    return instant ? [{ id, instant }] : []
  })

  return { date, prayers }
}

/** Calculates consecutive days starting at `start`. */
export function buildSchedules(
  start: CivilDate,
  count: number,
  point: GeoPoint,
  parameters: CalculationParameters,
): DaySchedule[] {
  return Array.from({ length: count }, (_, index) =>
    daySchedule(addCivilDays(start, index), point, parameters),
  )
}

/**
 * Finds the prayer window containing `now`.
 *
 * `schedules` must include the day before the visible range so an early-morning
 * visit still has a previous prayer to measure progress from.
 */
export function resolvePrayerWindow(schedules: DaySchedule[], now: Date): PrayerWindow | null {
  const timeline = schedules.flatMap((schedule) => schedule.prayers)
  const nextIndex = timeline.findIndex((prayer) => prayer.instant.getTime() > now.getTime())

  if (nextIndex < 1) {
    return null
  }

  const previous = timeline[nextIndex - 1]
  const next = timeline[nextIndex]
  const span = next.instant.getTime() - previous.instant.getTime()
  const elapsed = now.getTime() - previous.instant.getTime()
  const progress = span > 0 ? Math.min(Math.max(elapsed / span, 0), 1) : 0

  return { previous, next, progress }
}

/** Compass bearing from true north towards the Kaaba, in degrees. */
export function qiblaDirection(point: GeoPoint): number {
  return Qibla(new Coordinates(point.latitude, point.longitude))
}

export function addCivilDays(date: CivilDate, days: number): CivilDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

/** Stable `YYYY-MM-DD` key for a calendar day. */
export function civilDateKey(date: CivilDate): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

export function compareCivilDates(a: CivilDate, b: CivilDate): number {
  return Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)
}

/** Day of week for a calendar day, 0 = Sunday. */
export function civilWeekday(date: CivilDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()
}

export type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const zonedPartFormatters = new Map<string, Intl.DateTimeFormat>()

function zonedPartFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = zonedPartFormatters.get(timeZone)
  if (cached) {
    return cached
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  zonedPartFormatters.set(timeZone, formatter)
  return formatter
}

/** Wall-clock parts of `instant` as read on a clock inside `timeZone`. */
export function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = zonedPartFormatter(timeZone).formatToParts(instant)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  }
}

/** Returns the calendar day that `instant` falls on inside `timeZone`. */
export function civilDateIn(instant: Date, timeZone: string): CivilDate {
  const parts = zonedParts(instant, timeZone)
  return { year: parts.year, month: parts.month, day: parts.day }
}

/** Position of `instant` on a 24-hour clock face, from 0 to 1. */
export function dayFraction(instant: Date, timeZone: string): number {
  const parts = zonedParts(instant, timeZone)
  return (parts.hour * 3600 + parts.minute * 60 + parts.second) / 86400
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
