import type { CivilDate } from '@/lib/prayer'

/** Everything a dial variant needs to draw the day. */
export type DialView = {
  /** Whole days since the reference day, so the hand angle never wraps. */
  dayIndex: number
  /** How far through the local day the clock is, from 0 to 1. */
  fraction: number
  /** Day fractions of the five prayers, in chronological order. */
  markers: number[]
  /** Index into `markers` of the upcoming prayer, or null when it is tomorrow. */
  nextIndex: number | null
}

/** Whole days since a fixed reference, so a running angle never wraps. */
const REFERENCE_DAY = Math.floor(Date.UTC(2024, 0, 1) / 86_400_000)

export function dayIndex(date: CivilDate): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000) - REFERENCE_DAY
}

/** Hours in the day ring, one tick per hour. */
export const DAY_TICK_COUNT = 24
