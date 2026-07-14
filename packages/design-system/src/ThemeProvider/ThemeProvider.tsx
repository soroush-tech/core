import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Global, EmotionThemeProvider as DefaultThemeProvider } from '../index'
import { dark, light, type Theme } from '../themes'
import globalStyles from '../globalStyles'
import { ThemeContext } from './ThemeContext'

interface ThemeProviderProps {
  children: ReactNode
  /** Named dark/light pair to use when toggling. Defaults to the built-in dark/light themes. */
  themes?: { dark: Theme; light: Theme }
  /** Full custom override — bypasses mode switching entirely. Useful in tests and Storybook. */
  theme?: Theme
}

export const GlobalStyles = () => <Global styles={globalStyles} />

export function ThemeProvider({
  children,
  themes,
  theme: themeProp,
}: Readonly<ThemeProviderProps>) {
  const [isDark, setIsDark] = useState(true)
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [])
  const themeSet = themes ?? { dark, light }
  const theme = themeProp ?? (isDark ? themeSet.dark : themeSet.light)

  const contextValue = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      <DefaultThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </DefaultThemeProvider>
    </ThemeContext.Provider>
  )
}
