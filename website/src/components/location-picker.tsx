import { useDebouncedValue } from '@mantine/hooks'
import { MapPin, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  COUNTRIES,
  POPULAR_CITIES,
  countryName,
  expandCityQuery,
  popularCityChoice,
  type CityChoice,
} from '@/lib/cities'
import { MESSAGES, formatMessage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  CITY_RESULT_LIMIT,
  countWorldCityMatches,
  loadWorldCities,
  normalizeForSearch,
  searchWorldCities,
  worldCityChoice,
  type WorldCity,
} from '@/lib/world-cities'
import { usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'
import { Input } from './ui/input'

function CityRow({
  choice,
  detail,
  selected,
  onSelect,
}: {
  choice: CityChoice
  detail: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex w-full items-baseline justify-between gap-3 rounded-sm px-2.5 py-2 text-start text-sm',
          'transition-colors duration-150 outline-none hover:bg-muted',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          selected && 'bg-muted font-medium',
        )}
      >
        <span className="min-w-0 truncate">{choice.cityName}</span>
        <span className="min-w-0 shrink-0 truncate text-xs text-muted-foreground">{detail}</span>
      </button>
    </li>
  )
}

/** Device location, a worldwide city search and manual coordinates. */
export function LocationPicker() {
  const { state, actions } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const language = state.settings.language

  const [query, setQuery] = useState('')
  const [worldCities, setWorldCities] = useState<WorldCity[] | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [coordinateError, setCoordinateError] = useState(false)
  const [debouncedQuery] = useDebouncedValue(query, 140)

  // The dataset is fetched when the picker appears, so the first keystroke is
  // instant and the request never delays the page.
  useEffect(() => {
    let active = true

    loadWorldCities()
      .then((cities) => {
        if (active) {
          setWorldCities(cities)
        }
      })
      .catch(() => {
        if (active) {
          setWorldCities(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const searching = debouncedQuery.trim().length > 0
  const curatedMatches = useMemo(() => {
    if (!searching) {
      return []
    }

    // The curated list carries spellings the world dataset does not, such as
    // Mekkah, so its matches are offered first and the world results follow.
    const needle = normalizeForSearch(debouncedQuery)

    return POPULAR_CITIES.filter(
      (city) =>
        normalizeForSearch(city.name).includes(needle) ||
        normalizeForSearch(COUNTRIES[city.country][language]).includes(needle),
    ).map(popularCityChoice)
  }, [debouncedQuery, language, searching])

  const queries = useMemo(() => expandCityQuery(debouncedQuery), [debouncedQuery])

  const worldMatches = useMemo(() => {
    if (!searching || !worldCities) {
      return []
    }

    const seen = new Set<string>()
    const merged: WorldCity[] = []

    // Alternate spellings resolve to a canonical name, so `mekkah` still finds
    // Makkah even though the dataset only carries the modern spelling.
    for (const query of queries) {
      for (const city of searchWorldCities(worldCities, query)) {
        if (!seen.has(city.id)) {
          seen.add(city.id)
          merged.push(city)
        }
      }
    }

    return merged.slice(0, CITY_RESULT_LIMIT)
  }, [queries, searching, worldCities])

  const matches = useMemo(() => {
    const seen = new Set(curatedMatches.map((choice) => choice.cityName.toLowerCase()))
    const world = worldMatches
      .map(worldCityChoice)
      .filter((choice) => !seen.has(choice.cityName.toLowerCase()))

    return [...curatedMatches, ...world].slice(0, CITY_RESULT_LIMIT)
  }, [curatedMatches, worldMatches])

  const totalMatches = useMemo(
    () =>
      searching && worldCities
        ? queries.reduce((sum, query) => sum + countWorldCityMatches(worldCities, query), 0)
        : 0,
    [queries, searching, worldCities],
  )

  const submitCoordinates = () => {
    const lat = Number.parseFloat(latitude.replace(',', '.'))
    const lng = Number.parseFloat(longitude.replace(',', '.'))
    const isValid =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180

    setCoordinateError(!isValid)

    if (isValid) {
      actions.applyCoordinates(lat, lng)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={actions.requestDeviceLocation}
          disabled={state.locationStatus === 'requesting'}
        >
          <MapPin aria-hidden="true" />
          {state.locationStatus === 'requesting' ? t.locating : t.useMyLocation}
        </Button>
        <p className="text-xs text-muted-foreground">{t.useMyLocationHint}</p>
      </div>

      <div className="relative mt-5">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchCityPlaceholder}
          aria-label={t.searchCity}
          className="ps-9"
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {searching ? t.searchCityHint : t.popularCities}
      </p>

      {searching && !worldCities ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.loadingCities}…</p>
      ) : null}

      {searching && worldCities && matches.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.noCityResults}</p>
      ) : null}

      <ul className="scrollbar-hide mt-3 max-h-64 space-y-0.5 overflow-y-auto">
        {searching
          ? matches.map((choice) => (
              <CityRow
                key={`${choice.cityName}-${choice.latitude}-${choice.longitude}`}
                choice={choice}
                detail={
                  [choice.province, countryName(choice.countryCode, choice.countryName, language)]
                    .filter(Boolean)
                    .join(', ')
                }
                selected={
                  choice.cityName === state.location.cityName &&
                  choice.timeZone === state.location.timeZone
                }
                onSelect={() => actions.chooseCity(choice)}
              />
            ))
          : POPULAR_CITIES.map((city) => (
              <CityRow
                key={city.id}
                choice={popularCityChoice(city)}
                detail={COUNTRIES[city.country][language]}
                selected={city.id === state.location.cityId}
                onSelect={() => actions.chooseCity(popularCityChoice(city))}
              />
            ))}
      </ul>

      {searching && totalMatches > CITY_RESULT_LIMIT ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {formatMessage(t.showingMatches, {
            shown: matches.length,
            total: totalMatches + curatedMatches.length,
          })}
        </p>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-[13px] font-medium text-muted-foreground">{t.manualCoordinates}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.manualCoordinatesHint}</p>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="grid min-w-28 flex-1 gap-1.5 text-xs">
            <span className="text-muted-foreground">{t.latitude}</span>
            <Input
              inputMode="decimal"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="52.52"
            />
          </label>
          <label className="grid min-w-28 flex-1 gap-1.5 text-xs">
            <span className="text-muted-foreground">{t.longitude}</span>
            <Input
              inputMode="decimal"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="13.405"
            />
          </label>
          <Button variant="outline" onClick={submitCoordinates}>
            {t.applyCoordinates}
          </Button>
        </div>

        {coordinateError ? (
          <p className="mt-2 text-xs text-destructive">{t.invalidCoordinates}</p>
        ) : null}
      </div>
    </div>
  )
}
