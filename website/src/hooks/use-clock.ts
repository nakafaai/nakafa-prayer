import { useInterval, useWindowEvent } from '@mantine/hooks'
import { useState } from 'react'

/**
 * Clock that ticks while the page is visible.
 *
 * A hidden tab runs no timer, and the value is refreshed the moment the page
 * comes back, so a countdown is never shown stale.
 */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  // A hidden tab is throttled by the browser, so the timer may skip. Resyncing
  // the moment the page is visible again is what keeps the countdown honest.
  useWindowEvent('visibilitychange', () => {
    setNow(new Date())
  })

  useInterval(() => setNow(new Date()), intervalMs, { autoInvoke: true })

  return now
}
