import { renderHook, act } from '@testing-library/react'
import { useTheme } from '@emotion/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { dark, light } from '../themes'
import { ThemeProvider } from './ThemeProvider'
import { useThemeMode } from '../hooks/useThemeMode'

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

describe('ThemeProvider', () => {
  it('provides dark theme by default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current).toMatchObject({ name: dark.name })
  })

  it('provides light theme after toggling', () => {
    const { result } = renderHook(() => ({ theme: useTheme(), mode: useThemeMode() }), { wrapper })
    act(() => result.current.mode.toggleTheme())
    expect(result.current.mode.isDark).toBe(false)
    expect(result.current.theme).toMatchObject({ name: light.name })
  })

  it('uses an explicit theme prop over context', () => {
    const explicitWrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={light}>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper: explicitWrapper })
    expect(result.current).toMatchObject({ name: light.name })
  })

  describe('themes prop', () => {
    it('uses the custom dark theme when isDark is true', () => {
      const customDark = { ...dark, name: 'custom-dark' as const }
      const customLight = { ...light, name: 'custom-light' as const }
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider themes={{ dark: customDark, light: customLight }}>{children}</ThemeProvider>
      )
      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper })
      expect(result.current).toMatchObject({ name: 'custom-dark' })
    })

    it('uses the custom light theme after toggling', () => {
      const customDark = { ...dark, name: 'custom-dark' as const }
      const customLight = { ...light, name: 'custom-light' as const }
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider themes={{ dark: customDark, light: customLight }}>{children}</ThemeProvider>
      )
      const { result } = renderHook(() => ({ theme: useTheme(), mode: useThemeMode() }), {
        wrapper: customWrapper,
      })
      act(() => result.current.mode.toggleTheme())
      expect(result.current.theme).toMatchObject({ name: 'custom-light' })
    })
  })
})
