import { Data, Effect } from 'effect'
import {
  buildSchedules,
  calculationParameters,
  civilDateKey,
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
export class PrayerTimesUnavailable extends Data.TaggedError('PrayerTimesUnavailable')<{
  readonly dateKey: string
}> {}

export type DayPlan = {
  schedules: DaySchedule[]
  qibla: number
}

/**
 * Calculates consecutive days of prayer times plus the qibla bearing.
 *
 * One program owns the whole derivation, so a caller cannot accidentally pair
 * schedules calculated with different methods.
 */
export function planDays(
  start: CivilDate,
  count: number,
  location: SiteLocation,
  settings: PrayerSettings,
): Effect.Effect<DayPlan, PrayerTimesUnavailable> {
  return Effect.gen(function* () {
    const parameters = calculationParameters(settings.calculationMethod, settings.madhab)
    const schedules = buildSchedules(start, count, location, parameters)
    const incomplete = schedules.find((schedule) => schedule.prayers.length !== WAJIB_PRAYER_COUNT)

    if (incomplete) {
      return yield* new PrayerTimesUnavailable({ dateKey: civilDateKey(incomplete.date) })
    }

    return { schedules, qibla: qiblaDirection(location) }
  })
}
