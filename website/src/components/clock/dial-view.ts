import type { CivilDate } from '@/lib/prayer'

/** Everything a dial variant needs to draw the day. */
export type DialView = {
  /** Whole days since the reference day, so the hand angle never wraps. */
  dayIndex: number
  /** How far through the local day the clock is, from 0 to 1. */
  fraction: number
  /** The five prayers with their day fractions, in chronological order. */
  markers: { id: string; fraction: number }[]
  /** Index into `markers` of the upcoming prayer, or null when it is tomorrow. */
  nextIndex: number | null
}

/** Whole days since a fixed reference, so a running angle never wraps. */
const REFERENCE_DAY = Math.floor(Date.UTC(2024, 0, 1) / 86_400_000)

export function dayIndex(date: CivilDate): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000) - REFERENCE_DAY
}

/**
 * Hour marks around the dial: twelve, like a clock face.
 *
 * The dial still measures a full day, so each mark is two hours of local time
 * and the hand completes one turn from midnight to midnight.
 */
export const HOUR_MARK_COUNT = 12

/** Every third mark is longer, the way a clock face marks its quarters. */
export function isMajorHourMark(index: number): boolean {
  return index % 3 === 0
}
