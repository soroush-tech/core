import { useContext } from 'react'
import { ThemeContext } from '../ThemeProvider'

export function useThemeMode() {
  return useContext(ThemeContext)
}
