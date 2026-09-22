import { Effect, Exit } from 'effect'
import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useClock } from '@/hooks/use-clock'
import { useDeviceLocation } from '@/hooks/use-device-location'
import { useResolvedTheme } from '@/hooks/use-resolved-theme'
import { useStoredSettings, useStoredTheme } from '@/hooks/use-stored-settings'
import { cityLabel, defaultCityForTimeZone, findCity, nearestCity, type City } from '@/lib/cities'
import type { ClockOptions } from '@/lib/format'
import { MESSAGES } from '@/lib/i18n'
import {
  addCivilDays,
  civilDateIn,
  civilDateKey,
  resolvePrayerWindow,
  type DaySchedule,
} from '@/lib/prayer'
import { planDays } from '@/lib/prayer-program'
import { resolveHour12, resolveLocale } from '@/lib/settings'
import type { PrayerSettings, SiteLocation } from '@/lib/settings-schema'
import {
  ClockContext,
  ScheduleContext,
  usePrayerSchedule,
  type PrayerClockValue,
  type PrayerScheduleValue,
} from './prayer-context'

/** Yesterday plus a visible week, so the prayer window is always bracketed. */
const SCHEDULE_DAY_COUNT = 9

/** How often the calendar day is re-read. Prayer times change once a day. */
const DAY_TICK_MS = 60_000

function PrayerScheduleProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useStoredSettings()
  const [theme, setTheme] = useStoredTheme()
  const resolvedTheme = useResolvedTheme(theme)
  const { status: locationStatus, request: requestPositionEffect } = useDeviceLocation()
  const deviceTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  // Until a location is chosen, follow the device clock with a listed city's
  // coordinates and say so, instead of blocking the page behind a prompt.
  const fallbackLocation = useMemo<SiteLocation>(() => {
    const city = defaultCityForTimeZone(deviceTimeZone)
    return {
      source: 'city',
      label: cityLabel(city, settings.language),
      latitude: city.latitude,
      longitude: city.longitude,
      timeZone: deviceTimeZone,
      approximate: true,
      cityId: city.id,
    }
  }, [deviceTimeZone, settings.language])

  const location = settings.location ?? fallbackLocation
  const locale = resolveLocale(settings.language)
  const hour12 = useMemo(
    () => resolveHour12(settings.timeFormat, locale),
    [settings.timeFormat, locale],
  )
  const clock = useMemo<ClockOptions>(
    () => ({ timeZone: location.timeZone, locale, hour12 }),
    [location.timeZone, locale, hour12],
  )

  const now = useClock(DAY_TICK_MS)
  const today = useMemo(() => civilDateIn(now, location.timeZone), [now, location.timeZone])
  const todayKey = civilDateKey(today)

  const plan = useMemo(() => {
    const outcome = Effect.runSyncExit(
      planDays(addCivilDays(today, -1), SCHEDULE_DAY_COUNT, location, settings),
    )

    return Exit.isSuccess(outcome) ? outcome.value : null
  }, [today, location, settings])

  const schedules = useMemo<DaySchedule[]>(() => plan?.schedules ?? [], [plan])
  const week = useMemo(() => schedules.slice(1, 8), [schedules])

  const update = useCallback(
    (patch: Partial<PrayerSettings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch }

        if (patch.language && patch.language !== current.language && next.location?.cityId) {
          const city = findCity(next.location.cityId)
          if (city) {
            next.location = { ...next.location, label: cityLabel(city, patch.language) }
          }
        }

        return next
      })
    },
    [setSettings],
  )

  const requestDeviceLocation = useCallback(() => {
    requestPositionEffect((coordinates) => {
      setSettings((current) => ({
        ...current,
        location: {
          source: 'device',
          label: MESSAGES[current.language].locationDevice,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          timeZone: deviceTimeZone,
          approximate: false,
        },
      }))
    })
  }, [deviceTimeZone, requestPositionEffect, setSettings])

  const chooseCity = useCallback(
    (city: City) => {
      setSettings((current) => ({
        ...current,
        location: {
          source: 'city',
          label: cityLabel(city, current.language),
          latitude: city.latitude,
          longitude: city.longitude,
          timeZone: city.timeZone,
          approximate: false,
          cityId: city.id,
        },
      }))
    },
    [setSettings],
  )

  const applyCoordinates = useCallback(
    (latitude: number, longitude: number) => {
      setSettings((current) => {
        const city = nearestCity(latitude, longitude)

        return {
          ...current,
          location: {
            source: 'city',
            label: `${latitude}, ${longitude}`,
            latitude,
            longitude,
            // A nearby city supplies the right clock for the coordinates.
            timeZone: city?.timeZone ?? deviceTimeZone,
            approximate: !city,
          },
        }
      })
    },
    [deviceTimeZone, setSettings],
  )

  useEffect(() => {
    document.documentElement.lang = settings.language
  }, [settings.language])

  const value: PrayerScheduleValue = {
    state: {
      settings,
      theme,
      resolvedTheme,
      location,
      locationStatus,
      locale,
      hour12,
      clock,
      today,
      todayKey,
      schedules,
      week,
      qibla: plan?.qibla ?? 0,
      unavailable: plan === null,
    },
    actions: {
      update,
      setTheme,
      requestDeviceLocation,
      chooseCity,
      applyCoordinates,
    },
  }

  return <ScheduleContext value={value}>{children}</ScheduleContext>
}

function PrayerClockProvider({ children }: { children: ReactNode }) {
  const { state } = usePrayerSchedule()
  const now = useClock(1000)

  const value = useMemo<PrayerClockValue>(
    () => ({ now, window: resolvePrayerWindow(state.schedules, now) }),
    [now, state.schedules],
  )

  return <ClockContext value={value}>{children}</ClockContext>
}

/** Holds the location, settings and calculated schedules for the whole page. */
export function PrayerProviders({ children }: { children: ReactNode }) {
  return (
    <PrayerScheduleProvider>
      <PrayerClockProvider>{children}</PrayerClockProvider>
    </PrayerScheduleProvider>
  )
}
