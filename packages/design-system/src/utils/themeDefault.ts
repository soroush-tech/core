import type { Theme, ThemeDefaults } from '@emotion/react'

/**
 * Resolves a component's default token/variant key: the theme's optional
 * `defaults` override wins, otherwise the component's literal `fallback`.
 * Components call this in their prop defaults (`size = themeDefault(theme,
 * 'size', 'md')`) so every built-in default stays visible in the component
 * yet overridable per theme or via `ThemeProvider`'s `defaults` prop.
 */
export const themeDefault = <K extends keyof ThemeDefaults>(
  theme: Theme,
  key: K,
  fallback: NonNullable<ThemeDefaults[K]>
): NonNullable<ThemeDefaults[K]> =>
  (theme.defaults?.[key] ?? fallback) as NonNullable<ThemeDefaults[K]>
