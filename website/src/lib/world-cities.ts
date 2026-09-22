import { Schema } from 'effect'
import type { CityChoice } from './cities'

/**
 * The world city dataset.
 *
 * It comes from `city-timezones`, which bundles GeoNames cities with their IANA
 * time zone. The JSON is read as text and decoded with an Effect schema rather
 * than imported as a module: a typed JSON import would make TypeScript infer a
 * literal type for all seven thousand rows, and the package's own lookup
 * helpers only match a whole city name. The module is loaded lazily, so the
 * dataset never delays the first paint.
 */
const RawCitySchema = Schema.Struct({
  city: Schema.String,
  city_ascii: Schema.String,
  lat: Schema.Number,
  lng: Schema.Number,
  pop: Schema.Number,
  country: Schema.String,
  iso2: Schema.Union([Schema.String, Schema.Number]),
  province: Schema.String,
  /** Antarctic research stations carry no time zone and are dropped. */
  timezone: Schema.NullOr(Schema.String),
})

const decodeRawCities = Schema.decodeUnknownSync(
  Schema.fromJsonString(Schema.Array(RawCitySchema)),
)

export type WorldCity = {
  id: string
  name: string
  countryCode: string
  countryName: string
  province: string
  latitude: number
  longitude: number
  timeZone: string
  population: number
  /** Normalized haystack, precomputed once so a keystroke stays cheap. */
  haystack: string
  nameKey: string
}

export const CITY_RESULT_LIMIT = 40

let cache: WorldCity[] | null = null
let pending: Promise<WorldCity[]> | null = null

/** Lowercases and strips diacritics so `munchen` matches `München`. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toWorldCity(raw: (typeof RawCitySchema)['Type'], timeZone: string): WorldCity {
  const name = raw.city || raw.city_ascii

  return {
    id: `${raw.iso2}-${raw.lat}-${raw.lng}-${raw.city_ascii}`,
    name,
    countryCode: String(raw.iso2),
    countryName: raw.country,
    province: raw.province,
    latitude: raw.lat,
    longitude: raw.lng,
    timeZone,
    population: raw.pop,
    haystack: normalizeForSearch(`${name} ${raw.city_ascii} ${raw.province} ${raw.country}`),
    nameKey: normalizeForSearch(name),
  }
}

async function parseCities(): Promise<WorldCity[]> {
// Imported here, not at module scope, so the 1.9 MB of city text lands in the
  // lazy chunk instead of the bundle every visitor downloads first.
  const { default: rawCityMap } = await import('city-timezones/data/cityMap.json?raw')
  const cities: WorldCity[] = []

  for (const raw of decodeRawCities(rawCityMap)) {
    if (raw.timezone !== null) {
      cities.push(toWorldCity(raw, raw.timezone))
    }
  }

  return cities.sort((a, b) => b.population - a.population)
}

/** Loads and caches the dataset. Repeat calls share one request. */
export function loadWorldCities(): Promise<WorldCity[]> {
  if (cache) {
    return Promise.resolve(cache)
  }

  pending ??= parseCities().then((cities) => {
    cache = cities
    pending = null
    return cities
  })

  return pending
}

/** The dataset when it is already loaded, otherwise null. */
export function loadedWorldCities(): WorldCity[] | null {
  return cache
}

/** A dataset row as a choosable place. */
export function worldCityChoice(city: WorldCity): CityChoice {
  return {
    cityName: city.name,
    province: city.province,
    countryCode: city.countryCode,
    countryName: city.countryName,
    latitude: city.latitude,
    longitude: city.longitude,
    timeZone: city.timeZone,
  }
}

/**
 * Type-ahead search, best match first.
 *
 * A name prefix outranks a word prefix, which outranks a substring, and a
 * bigger city outranks a smaller one at the same rank. That is what puts London
 * in England above London in Ontario for `lon`.
 */
export function searchWorldCities(cities: WorldCity[], query: string): WorldCity[] {
  const needle = normalizeForSearch(query)

  if (needle.length === 0) {
    return cities.slice(0, CITY_RESULT_LIMIT)
  }

  const scored: { city: WorldCity; score: number }[] = []

  for (const city of cities) {
    let score = Number.POSITIVE_INFINITY

    if (city.nameKey === needle) {
      score = 0
    } else if (city.nameKey.startsWith(needle)) {
      score = 1
    } else if (city.haystack.startsWith(needle)) {
      score = 2
    } else if (city.haystack.includes(` ${needle}`)) {
      score = 3
    } else if (city.haystack.includes(needle)) {
      score = 4
    }

    if (Number.isFinite(score)) {
      scored.push({ city, score })
    }
  }

  scored.sort((a, b) => a.score - b.score || b.city.population - a.city.population)

  return scored.slice(0, CITY_RESULT_LIMIT).map((entry) => entry.city)
}

/** Total matches for a query, so the list can say what it is not showing. */
export function countWorldCityMatches(cities: WorldCity[], query: string): number {
  const needle = normalizeForSearch(query)

  if (needle.length === 0) {
    return cities.length
  }

  return cities.filter((city) => city.haystack.includes(needle)).length
}
