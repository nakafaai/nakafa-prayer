import { Schema } from 'effect'
import { CALCULATION_METHOD_IDS, MADHAB_IDS } from './prayer'

/**
 * The stored preference shape.
 *
 * `localStorage` is untrusted input, so one schema owns decoding it. A record
 * that no longer matches is discarded instead of being coerced into place.
 */
export const LANGUAGE_PREFERENCES = ['en', 'id'] as const
export const TIME_FORMATS = ['system', 'h12', 'h24'] as const
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const

export const LanguageSchema = Schema.Literals(LANGUAGE_PREFERENCES)
export const CalculationMethodSchema = Schema.Literals(CALCULATION_METHOD_IDS)
export const MadhabSchema = Schema.Literals(MADHAB_IDS)
export const TimeFormatSchema = Schema.Literals(TIME_FORMATS)
export const ThemeSchema = Schema.Literals(THEME_PREFERENCES)

export const SiteLocationSchema = Schema.Struct({
  source: Schema.Literals(['device', 'city']),
  label: Schema.String,
  latitude: Schema.Number.pipe(Schema.check(Schema.isBetween({ minimum: -90, maximum: 90 }))),
  longitude: Schema.Number.pipe(
    Schema.check(Schema.isBetween({ minimum: -180, maximum: 180 })),
  ),
  timeZone: Schema.String,
  /** True when the coordinates were inferred from a time zone, not chosen. */
  approximate: Schema.Boolean,
  /** Set when the location came from the city picker, so labels follow language. */
  cityId: Schema.optionalKey(Schema.String),
})

export const PrayerSettingsSchema = Schema.Struct({
  language: LanguageSchema,
  calculationMethod: CalculationMethodSchema,
  madhab: MadhabSchema,
  timeFormat: TimeFormatSchema,
  location: Schema.NullOr(SiteLocationSchema),
})

export type SiteLocation = typeof SiteLocationSchema.Type
export type PrayerSettings = typeof PrayerSettingsSchema.Type
export type ThemePreference = typeof ThemeSchema.Type
export type TimeFormat = typeof TimeFormatSchema.Type
export type LanguagePreference = typeof LanguageSchema.Type

export const decodeSettings = Schema.decodeUnknownOption(PrayerSettingsSchema)
export const encodeSettings = Schema.encodeSync(PrayerSettingsSchema)
export const decodeTheme = Schema.decodeUnknownOption(ThemeSchema)
