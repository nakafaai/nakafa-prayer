import { useLocalStorage } from '@mantine/hooks'
import { Option } from 'effect'
import { useMemo } from 'react'
import {
  SETTINGS_STORAGE_KEY,
  THEME_STORAGE_KEY,
  createDefaultSettings,
  withUsableLocation,
} from '@/lib/settings'
import {
  decodeStoredSettings,
  decodeTheme,
  encodeStoredSettings,
  encodeStoredSettingsSync,
  type PrayerSettings,
  type ThemePreference,
} from '@/lib/settings-schema'

/**
 * Prayer settings in `localStorage`, decoded through the Effect schema.
 *
 * The initial value is read synchronously so the first paint already shows the
 * visitor's own location instead of a default that flashes and corrects.
 */
export function useStoredSettings() {
  const fallback = useMemo(() => createDefaultSettings(), [])

  return useLocalStorage<PrayerSettings>({
    key: SETTINGS_STORAGE_KEY,
    defaultValue: fallback,
    getInitialValueInEffect: false,
    serialize: (value) =>
      Option.getOrElse(
        encodeStoredSettings(value),
        () => localStorage.getItem(SETTINGS_STORAGE_KEY) ?? encodeStoredSettingsSync(fallback),
      ),
    deserialize: (raw) =>
      withUsableLocation(Option.getOrElse(decodeStoredSettings(raw), () => fallback)),
  })
}

/**
 * Appearance preference, stored as a bare string.
 *
 * The `theme-init.js` script in `index.html` reads this same key before the
 * first paint, which is what keeps a dark visitor from seeing a white flash.
 */
export function useStoredTheme() {
  return useLocalStorage<ThemePreference>({
    key: THEME_STORAGE_KEY,
    defaultValue: 'system',
    getInitialValueInEffect: false,
    serialize: (value) => value,
    deserialize: (raw) =>
      raw === undefined ? 'system' : Option.getOrElse(decodeTheme(raw), () => 'system'),
  })
}
