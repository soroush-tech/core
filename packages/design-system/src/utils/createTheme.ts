import type { Theme } from '../themes'

/**
 * Recursive partial of a theme shape. Plain objects recurse; arrays and
 * functions are replaced wholesale by `createTheme`, so they stay intact here.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends (...args: never[]) => unknown
      ? T[K]
      : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K]
}

/** Sparse theme patch accepted by `createTheme` and `ThemeProvider`'s `themes` prop. */
export type ThemeOverride = DeepPartial<Theme>

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const deepMerge = (base: Record<string, unknown>, overrides: Record<string, unknown>) => {
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue
    }
    const baseValue = merged[key]
    merged[key] =
      isPlainObject(baseValue) && isPlainObject(value) ? deepMerge(baseValue, value) : value
  }
  return merged
}

/**
 * Builds a theme by deep-merging sparse `overrides` onto `base`.
 *
 * - Recurses only where both sides are plain objects; arrays (`shadows`,
 *   `fontSizes`) and functions replace wholesale.
 * - `undefined` override values are ignored — a key can be added or replaced,
 *   never removed.
 * - Neither argument is mutated; untouched branches keep referential identity.
 */
export const createTheme = (base: Theme, overrides: ThemeOverride): Theme =>
  deepMerge(
    base as unknown as Record<string, unknown>,
    overrides as Record<string, unknown>
  ) as unknown as Theme
