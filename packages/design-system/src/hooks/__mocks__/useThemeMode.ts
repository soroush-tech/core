import { fn } from 'storybook/test'

export const useThemeMode = fn(() => ({ isDark: false, toggleTheme: fn() }))
