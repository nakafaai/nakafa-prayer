import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
  type CalculationParameters,
} from 'adhan'
import { Array as Arr, DateTime, MutableHashMap, Option, Schema } from 'effect'

/** The five wajib prayers the macOS app schedules, in chronological order. */
export const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export const PrayerIdSchema = Schema.Literals(PRAYER_IDS)
export type PrayerId = typeof PrayerIdSchema.Type

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

export const CalculationMethodIdSchema = Schema.Literals(CALCULATION_METHOD_IDS)
export type CalculationMethodId = typeof CalculationMethodIdSchema.Type

/** Asr shadow-length schools shared with the macOS app. */
export const MADHAB_IDS = ['shafi', 'hanafi'] as const

export const MadhabIdSchema = Schema.Literals(MADHAB_IDS)
export type MadhabId = typeof MadhabIdSchema.Type

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
export const CivilDateSchema = Schema.Struct({
  year: Schema.Finite,
  month: Schema.Finite,
  day: Schema.Finite,
})
export type CivilDate = typeof CivilDateSchema.Type

export const GeoPointSchema = Schema.Struct({
  latitude: Schema.Finite,
  longitude: Schema.Finite,
})
export type GeoPoint = typeof GeoPointSchema.Type

export const PrayerInstantSchema = Schema.Struct({
  id: PrayerIdSchema,
  instant: Schema.Date,
})
export type PrayerInstant = { readonly id: PrayerId; readonly instant: Date }

export const DayScheduleSchema = Schema.Struct({
  date: CivilDateSchema,
  prayers: Schema.Array(PrayerInstantSchema),
})
export type DaySchedule = { readonly date: CivilDate; readonly prayers: readonly PrayerInstant[] }

/** A prayer interval with the elapsed fraction between its two ends. */
export const PrayerWindowSchema = Schema.Struct({
  previous: PrayerInstantSchema,
  next: PrayerInstantSchema,
  progress: Schema.Finite,
})
export type PrayerWindow = {
  readonly previous: PrayerInstant
  readonly next: PrayerInstant
  readonly progress: number
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

function localCivilDate(date: CivilDate): Date {
  return DateTime.toDateUtc(
    DateTime.makeZonedUnsafe(
      { year: date.year, month: date.month, day: date.day },
      { adjustForTimeZone: true, timeZone: DateTime.zoneMakeLocal() },
    ),
  )
}

function utcCivilDateTime(date: CivilDate): DateTime.Utc {
  return DateTime.makeUnsafe({ year: date.year, month: date.month, day: date.day })
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
    localCivilDate(date),
    parameters,
  )

  const prayers = Arr.flatMap(PRAYER_IDS, (id) => {
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
  return Arr.makeBy(count, (index) =>
    daySchedule(addCivilDays(start, index), point, parameters),
  )
}

/**
 * Finds the prayer window containing `now`.
 *
 * `schedules` must include the day before the visible range so an early-morning
 * visit still has a previous prayer to measure progress from.
 */
export function resolvePrayerWindow(
  schedules: readonly DaySchedule[],
  now: Date,
): PrayerWindow | null {
  const timeline = Arr.flatMap(schedules, (schedule) => schedule.prayers)
  const nextIndex = Option.getOrElse(
    Arr.findFirstIndex(timeline, (prayer) => prayer.instant.getTime() > now.getTime()),
    () => -1,
  )

  if (nextIndex < 1) {
    return null
  }

  const previous = timeline[nextIndex - 1]
  const next = timeline[nextIndex]
  if (!(previous && next)) {
    return null
  }

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
  const parts = DateTime.toPartsUtc(DateTime.add(utcCivilDateTime(date), { days }))
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
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
  return DateTime.toPartsUtc(utcCivilDateTime(date)).weekDay
}

export const ZonedPartsSchema = Schema.Struct({
  year: Schema.Finite,
  month: Schema.Finite,
  day: Schema.Finite,
  hour: Schema.Finite,
  minute: Schema.Finite,
  second: Schema.Finite,
})
export type ZonedParts = typeof ZonedPartsSchema.Type

const zonedPartFormatters = MutableHashMap.empty<string, Intl.DateTimeFormat>()

function zonedPartFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = MutableHashMap.get(zonedPartFormatters, timeZone)
  if (Option.isSome(cached)) {
    return cached.value
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
  MutableHashMap.set(zonedPartFormatters, timeZone, formatter)
  return formatter
}

/** Wall-clock parts of `instant` as read on a clock inside `timeZone`. */
export function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = zonedPartFormatter(timeZone).formatToParts(instant)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(
      Option.match(
        Arr.findFirst(parts, (part) => part.type === type),
        { onNone: () => '0', onSome: (part) => part.value },
      ),
    )

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
