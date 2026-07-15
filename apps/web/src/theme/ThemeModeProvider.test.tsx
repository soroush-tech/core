import { act, renderHook } from '@testing-library/react'
import { useTheme } from '@emotion/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { dark, light } from 'src/theme/themes'
import { ThemeModeProvider } from './ThemeModeProvider'
import { useThemeMode } from './useThemeMode'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeModeProvider>{children}</ThemeModeProvider>
)

describe('ThemeModeProvider', () => {
  it('provides the brand dark theme by default', () => {
    const { result } = renderHook(() => ({ theme: useTheme(), mode: useThemeMode() }), { wrapper })
    expect(result.current.mode.isDark).toBe(true)
    expect(result.current.theme).toMatchObject({ name: dark.name })
    expect(result.current.theme.palette.primary.main).toBe(dark.palette.primary.main)
  })

  it('switches to the brand light theme on toggle', () => {
    const { result } = renderHook(() => ({ theme: useTheme(), mode: useThemeMode() }), { wrapper })
    act(() => result.current.mode.toggleTheme())
    expect(result.current.mode.isDark).toBe(false)
    expect(result.current.theme).toMatchObject({ name: light.name })
  })

  it('useThemeMode outside the provider returns the inert default', () => {
    const { result } = renderHook(() => useThemeMode())
    expect(result.current.isDark).toBe(true)
    expect(() => result.current.toggleTheme()).not.toThrow()
  })
})
