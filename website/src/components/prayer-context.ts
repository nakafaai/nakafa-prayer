import { createContext, use } from 'react'
import type { LocationStatus } from '@/hooks/use-device-location'
import type { City } from '@/lib/cities'
import type { ClockOptions } from '@/lib/format'
import type { CivilDate, DaySchedule, PrayerWindow } from '@/lib/prayer'
import type { PrayerSettings, SiteLocation, ThemePreference } from '@/lib/settings-schema'

export type PrayerScheduleState = {
  settings: PrayerSettings
  theme: ThemePreference
  resolvedTheme: 'light' | 'dark'
  location: SiteLocation
  locationStatus: LocationStatus
  locale: string
  hour12: boolean
  clock: ClockOptions
  today: CivilDate
  todayKey: string
  schedules: DaySchedule[]
  week: DaySchedule[]
  qibla: number
  /** True when the calculation cannot produce a complete day here. */
  unavailable: boolean
}

export type PrayerScheduleActions = {
  update: (patch: Partial<PrayerSettings>) => void
  setTheme: (theme: ThemePreference) => void
  requestDeviceLocation: () => void
  chooseCity: (city: City) => void
  applyCoordinates: (latitude: number, longitude: number) => void
}

export type PrayerScheduleValue = {
  state: PrayerScheduleState
  actions: PrayerScheduleActions
}

export type PrayerClockValue = {
  now: Date
  window: PrayerWindow | null
}

export const ScheduleContext = createContext<PrayerScheduleValue | null>(null)
export const ClockContext = createContext<PrayerClockValue | null>(null)

/** Reads the stable schedule context. Re-renders only when settings change. */
export function usePrayerSchedule(): PrayerScheduleValue {
  const value = use(ScheduleContext)

  if (!value) {
    throw new Error('usePrayerSchedule must be used inside <PrayerProviders>')
  }

  return value
}

/** Reads the per-second clock context. */
export function usePrayerClock(): PrayerClockValue {
  const value = use(ClockContext)

  if (!value) {
    throw new Error('usePrayerClock must be used inside <PrayerProviders>')
  }

  return value
}
