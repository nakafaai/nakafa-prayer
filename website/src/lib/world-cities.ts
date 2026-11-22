import { Array as Arr, Option, Order, Schema } from 'effect'
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
  lat: Schema.Finite,
  lng: Schema.Finite,
  pop: Schema.Finite,
  country: Schema.String,
  iso2: Schema.Union([Schema.String, Schema.Finite]),
  province: Schema.String,
  /** Antarctic research stations carry no time zone and are dropped. */
  timezone: Schema.NullOr(Schema.String),
})

const decodeRawCities = Schema.decodeUnknownSync(
  Schema.fromJsonString(Schema.Array(RawCitySchema)),
)

export const WorldCitySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  countryCode: Schema.String,
  countryName: Schema.String,
  province: Schema.String,
  latitude: Schema.Finite,
  longitude: Schema.Finite,
  timeZone: Schema.String,
  population: Schema.Finite,
  /** Normalized haystack, precomputed once so a keystroke stays cheap. */
  haystack: Schema.String,
  nameKey: Schema.String,
})

export type WorldCity = typeof WorldCitySchema.Type

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

function toWorldCity(raw: typeof RawCitySchema.Type, timeZone: string): WorldCity {
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

const byPopulationDesc: Order.Order<WorldCity> = Order.make((a, b) =>
  a.population > b.population ? -1 : a.population < b.population ? 1 : 0,
)

async function parseCities(): Promise<WorldCity[]> {
  // Imported here, not at module scope, so the 1.9 MB of city text lands in the
  // lazy chunk instead of the bundle every visitor downloads first.
  const { default: rawCityMap } = await import('city-timezones/data/cityMap.json?raw')
  const cities = Arr.getSomes(
    Arr.map(decodeRawCities(rawCityMap), (raw) =>
      raw.timezone === null
        ? Option.none()
        : Option.some(toWorldCity(raw, raw.timezone)),
    ),
  )

  return Arr.sort(cities, byPopulationDesc)
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

const byScoreThenPopulation: Order.Order<{ readonly city: WorldCity; readonly score: number }> =
  Order.make((a, b) => {
    if (a.score !== b.score) {
      return a.score < b.score ? -1 : 1
    }
    return a.city.population > b.city.population
      ? -1
      : a.city.population < b.city.population
        ? 1
        : 0
  })

/**
 * Type-ahead search, best match first.
 *
 * A name prefix outranks a word prefix, which outranks a substring, and a
 * bigger city outranks a smaller one at the same rank. That is what puts London
 * in England above London in Ontario for `lon`.
 */
export function searchWorldCities(cities: readonly WorldCity[], query: string): WorldCity[] {
  const needle = normalizeForSearch(query)

  if (needle.length === 0) {
    return Arr.take(cities, CITY_RESULT_LIMIT)
  }

  const scored = Arr.getSomes(
    Arr.map(cities, (city) => {
      if (city.nameKey === needle) {
        return Option.some({ city, score: 0 })
      }
      if (city.nameKey.startsWith(needle)) {
        return Option.some({ city, score: 1 })
      }
      if (city.haystack.startsWith(needle)) {
        return Option.some({ city, score: 2 })
      }
      if (city.haystack.includes(` ${needle}`)) {
        return Option.some({ city, score: 3 })
      }
      if (city.haystack.includes(needle)) {
        return Option.some({ city, score: 4 })
      }
      return Option.none()
    }),
  )

  return Arr.map(
    Arr.take(Arr.sort(scored, byScoreThenPopulation), CITY_RESULT_LIMIT),
    (entry) => entry.city,
  )
}

/** Total matches for a query, so the list can say what it is not showing. */
export function countWorldCityMatches(cities: readonly WorldCity[], query: string): number {
  const needle = normalizeForSearch(query)

  if (needle.length === 0) {
    return cities.length
  }

  return Arr.filter(cities, (city) => city.haystack.includes(needle)).length
}
