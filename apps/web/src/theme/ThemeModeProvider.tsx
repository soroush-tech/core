import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { dark, light } from 'src/theme/themes'
import { ThemeModeContext } from 'src/theme/useThemeMode'

// Owns the site's light/dark mode state. Theme switching is app policy, not the
// design system's — the package ThemeProvider just receives the active brand theme.
export function ThemeModeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isDark, setIsDark] = useState(true)
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [])
  const contextValue = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme])

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={isDark ? dark : light}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
