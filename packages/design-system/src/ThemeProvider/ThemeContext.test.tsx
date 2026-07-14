import { useContext } from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { ThemeContext } from './ThemeContext'

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

describe('ThemeContext', () => {
  describe('default value (outside provider)', () => {
    it('isDark defaults to true', () => {
      const { result } = renderHook(() => useContext(ThemeContext))
      expect(result.current.isDark).toBe(true)
    })

    it('toggleTheme is a no-op function', () => {
      const { result } = renderHook(() => useContext(ThemeContext))
      expect(() => result.current.toggleTheme()).not.toThrow()
    })
  })

  describe('toggle (inside ThemeProvider)', () => {
    it('isDark starts true', () => {
      const { result } = renderHook(() => useContext(ThemeContext), { wrapper })
      expect(result.current.isDark).toBe(true)
    })

    it('toggleTheme flips isDark to false', () => {
      const { result } = renderHook(() => useContext(ThemeContext), { wrapper })
      act(() => result.current.toggleTheme())
      expect(result.current.isDark).toBe(false)
    })

    it('toggleTheme can toggle back to true', () => {
      const { result } = renderHook(() => useContext(ThemeContext), { wrapper })
      act(() => result.current.toggleTheme())
      act(() => result.current.toggleTheme())
      expect(result.current.isDark).toBe(true)
    })
  })
})
