import { createContext, useContext } from 'react'

export interface ThemeModeContextValue {
  isDark: boolean
  toggleTheme: () => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  isDark: true,
  toggleTheme: () => {},
})

/** The site's light/dark mode state, provided by `ThemeModeProvider`. */
export function useThemeMode() {
  return useContext(ThemeModeContext)
}
