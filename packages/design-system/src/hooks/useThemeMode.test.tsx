import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { ThemeProvider } from '../ThemeProvider'
import { useThemeMode } from './useThemeMode'

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

describe('useThemeMode', () => {
  it('defaults to dark mode', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper })
    expect(result.current.isDark).toBe(true)
  })

  it('toggleTheme flips isDark to false', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper })
    act(() => result.current.toggleTheme())
    expect(result.current.isDark).toBe(false)
  })

  it('toggleTheme can toggle back to dark', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper })
    act(() => result.current.toggleTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('returns default values outside provider', () => {
    const { result } = renderHook(() => useThemeMode())
    expect(result.current.isDark).toBe(true)
    expect(typeof result.current.toggleTheme).toBe('function')
  })
})
