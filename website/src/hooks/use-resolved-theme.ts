import { useIsomorphicEffect, useMediaQuery } from '@mantine/hooks'
import type { ThemePreference } from '@/lib/settings-schema'

const THEME_COLORS = { light: '#ffffff', dark: '#060d18' } as const

/**
 * Applies the appearance preference to the document and reports the active one.
 *
 * Transitions are suppressed for the swap, because a theme flip changes nearly
 * every colour at once and would smear instead of snapping.
 */
export function useResolvedTheme(theme: ThemePreference): 'light' | 'dark' {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', false, {
    getInitialValueInEffect: false,
  })
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme

  useIsomorphicEffect(() => {
    const root = document.documentElement

    root.classList.add('theme-transition-off')
    root.classList.toggle('dark', resolved === 'dark')
    void root.offsetWidth
    root.classList.remove('theme-transition-off')

    document.getElementById('theme-color')?.setAttribute('content', THEME_COLORS[resolved])
  }, [resolved])

  return resolved
}
