import { Array as Arr, Effect, Option, Schema } from 'effect'
import {
  buildSchedules,
  calculationParameters,
  civilDateKey,
  DayScheduleSchema,
  qiblaDirection,
  type CivilDate,
  type DaySchedule,
} from './prayer'
import type { PrayerSettings, SiteLocation } from './settings-schema'

/** The five wajib prayers a complete day must contain. */
const WAJIB_PRAYER_COUNT = 5

/**
 * A day whose solar transit or twilight angle does not exist.
 *
 * `adhan` resolves most polar cases, so this is the honest fallback instead of
 * rendering a partial list as if it were complete.
 */
export class PrayerTimesUnavailable extends Schema.TaggedError<
  PrayerTimesUnavailable,
  { readonly brand: unique symbol }
>()('PrayerTimesUnavailable', {
  dateKey: Schema.String,
}) {}

export const DayPlanSchema = Schema.Struct({
  schedules: Schema.Array(DayScheduleSchema),
  qibla: Schema.Finite,
})

export type DayPlan = {
  readonly schedules: DaySchedule[]
  readonly qibla: number
}

/**
 * Calculates consecutive days of prayer times plus the qibla bearing.
 *
 * One program owns the whole derivation, so a caller cannot accidentally pair
 * schedules calculated with different methods.
 */
export const planDays = Effect.fn('prayer.planDays')(function* (
  start: CivilDate,
  count: number,
  location: SiteLocation,
  settings: PrayerSettings,
): Effect.fn.Return<DayPlan, PrayerTimesUnavailable> {
  const parameters = calculationParameters(settings.calculationMethod, settings.madhab)
  const schedules = buildSchedules(start, count, location, parameters)
  const incomplete = Arr.findFirst(
    schedules,
    (schedule) => schedule.prayers.length !== WAJIB_PRAYER_COUNT,
  )

  if (Option.isSome(incomplete)) {
    return yield* new PrayerTimesUnavailable({ dateKey: civilDateKey(incomplete.value.date) })
  }

  return { schedules, qibla: qiblaDirection(location) }
})
