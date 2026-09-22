# Website agent guide

This directory holds the Nakafa Prayer website. The repository root guide still
applies; this one adds the conventions specific to the site.

## Stack

Vite, React 19, Tailwind CSS v4, Radix primitives, Mantine hooks and Effect.

## Conventions

- Reach for a Mantine hook before writing a new one. `useInterval`,
  `useLocalStorage`, `useMediaQuery`, `useDisclosure`, `useWindowEvent`,
  `useIsomorphicEffect` and `useReducedMotion` already cover the generic cases.
  Only write a hook when it encodes domain knowledge, such as the clock or the
  prayer swap counter.
- Effect owns boundaries and error channels. Stored settings are decoded with a
  `Schema`, geolocation fails with a typed `LocationError`, and the whole day
  plan is one program in `src/lib/prayer-program.ts`. Compose with `Effect.gen`
  instead of wrapping domain calls in `try`/`catch`.
- The installed Effect source is the reference for its API. Version 4 ships
  readable TypeScript at `node_modules/effect/src`, notes at
  `node_modules/effect/ai-docs`, and its own `AGENTS.md`. Read those before
  guessing at a signature.
- Radix owns accessible behaviour, Tailwind owns layout, `cn` merges classes.
  Compose primitives instead of adding boolean props to them.
- Motion values live in `src/index.css`. Entrances use `--ease-out-strong`,
  colour uses `ease`, constant motion uses `linear`, and UI never uses `ease-in`
  or animates from `scale(0)`. Every moving element needs a
  `prefers-reduced-motion` path, and hover motion stays behind
  `@media (hover: hover) and (pointer: fine)`.
- `pnpm run build` must stay a direct `vite build`, because the hosting runtime
  runs it as the framework build command. Use `pnpm run verify` for the type
  check, the linter and the build together.

## Privacy boundary

Every prayer time is calculated in the browser. Do not add a request that sends
coordinates, and do not add analytics or a tracking cookie.
