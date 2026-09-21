import { MapPin, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CITIES, COUNTRIES } from '@/lib/cities'
import { MESSAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { usePrayerSchedule } from './prayer-context'
import { Button } from './ui/button'
import { Input } from './ui/input'

/** Device location, a searchable city list and manual coordinates. */
export function LocationPicker() {
  const { state, actions } = usePrayerSchedule()
  const t = MESSAGES[state.settings.language]
  const [query, setQuery] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [coordinateError, setCoordinateError] = useState(false)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) {
      return CITIES
    }

    return CITIES.filter((city) => {
      const country = COUNTRIES[city.country]
      return `${city.name} ${country.en} ${country.id}`.toLowerCase().includes(needle)
    })
  }, [query])

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

      {matches.length > 0 ? (
        <ul className="scrollbar-hide mt-2 max-h-56 space-y-0.5 overflow-y-auto">
          {matches.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => actions.chooseCity(city)}
                aria-current={city.id === state.location.cityId ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-start text-sm',
                  'transition-colors duration-150 outline-none hover:bg-muted',
                  'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  city.id === state.location.cityId && 'bg-muted font-medium',
                )}
              >
                <span className="truncate">{city.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {COUNTRIES[city.country][state.settings.language]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{t.noCityResults}</p>
      )}

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
