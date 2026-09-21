# Nakafa Prayer website

A public web page that shows today's prayer times for the visitor's location.
It is the browser companion to the macOS menu bar app in this repository.

## What it does

- Shows the next prayer, its time, and a live countdown.
- Lists today's five wajib prayers with the current interval and the next one marked.
- Shows a seven day timetable.
- Lets the visitor use the device location, pick from a city list, or enter coordinates.
- Supports the same calculation methods and Asr schools as the macOS app.
- Ships English and Indonesian, following the app's own localized prayer and method names.

## Privacy

Every prayer time is calculated inside the page with
[`adhan`](https://github.com/batoulapps/adhan-js), the JavaScript counterpart of
the app's `adhan-swift`. No coordinates leave the device, there is no account,
no tracking cookie and no analytics. Preferences live in `localStorage` only.

## Stack

Vite, React 19, Tailwind CSS v4, Radix primitives, Mantine hooks and Effect,
using the Nakafa design tokens from `packages/design-system` in `nakafa.com`.

Effect is used where it earns its place: `Schema` decodes the stored
preferences, geolocation returns a typed error instead of throwing, and one
program derives the day plan. TanStack Query is deliberately absent, because the
page has no server data to cache.

## Development

```bash
pnpm install
pnpm run dev
```

## Checks

```bash
pnpm run verify
```

`pnpm run build` stays a direct `vite build`, because the hosting runtime runs it
as the framework build command. `verify` adds the type check and the linter.

pnpm is the pinned package manager, so commit `pnpm-lock.yaml` and do not add a
second lockfile.

## Layout

- `src/lib/prayer.ts` owns the calculation domain: stable IDs, method mapping,
  the local-time to instant conversion, and the current prayer window.
- `src/lib/format.ts` owns every `Intl` format, always bound to a time zone.
- `src/lib/cities.ts` owns the country and city data used for defaults and search.
- `src/lib/settings.ts` owns the stored preference shape and its validation.
- `src/components/prayer-provider.tsx` owns state; `prayer-context.ts` exposes it.
