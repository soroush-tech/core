import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { EmotionThemeProvider as DefaultThemeProvider } from '../engine'
import { baseTheme, type Theme, type ThemeDefaults } from '../themes'
import { createTheme } from '../utils/createTheme'

interface ThemeProviderProps {
  children: ReactNode
  /**
   * The active theme. Bring one theme, or as many as you like — switching
   * between them is your state, not the provider's. Defaults to the built-in
   * `baseTheme`.
   */
  theme?: Theme
  /**
   * Optional component default token/variant keys, merged into the theme
   * (e.g. `{ size: 'compact' }` makes every sized component default to your key).
   */
  defaults?: ThemeDefaults
}

export function ThemeProvider({
  children,
  theme = baseTheme,
  defaults,
}: Readonly<ThemeProviderProps>) {
  const value = useMemo(
    () => (defaults ? createTheme(theme, { defaults }) : theme),
    [theme, defaults]
  )
  return <DefaultThemeProvider theme={value}>{children}</DefaultThemeProvider>
}
