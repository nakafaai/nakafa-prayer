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
  /** City parts, stored so the label can be rebuilt in either language. */
  cityName: Schema.optionalKey(Schema.String),
  countryCode: Schema.optionalKey(Schema.String),
  countryName: Schema.optionalKey(Schema.String),
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

/**
 * Stored settings decoded straight from their JSON text.
 *
 * `localStorage` hands back a string, so parsing and validating are one step:
 * absent or malformed text, or a record that no longer matches the schema,
 * yields `None` and the caller falls back to the defaults.
 */
export const decodeStoredSettings = Schema.decodeUnknownOption(
  Schema.fromJsonString(PrayerSettingsSchema),
)

/**
 * Literal decoders for the controlled inputs.
 *
 * Radix reports a bare `string` for a select or a segmented control, so the
 * value passes through the same schema that owns the setting instead of an
 * assertion that would let anything off-menu into state.
 */
export const decodeCalculationMethod = Schema.decodeUnknownOption(CalculationMethodSchema)
export const decodeMadhab = Schema.decodeUnknownOption(MadhabSchema)
export const decodeLanguage = Schema.decodeUnknownOption(LanguageSchema)
export const decodeTimeFormat = Schema.decodeUnknownOption(TimeFormatSchema)
