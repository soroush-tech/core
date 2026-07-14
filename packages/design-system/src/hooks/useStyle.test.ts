import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'
import { ThemeProvider } from '../ThemeProvider'
import { dark } from '../themes'
import { useStyle } from './useStyle'

const wrapper = ({ children }: { children: ReactNode }) => ThemeProvider({ children, theme: dark })

describe('useStyle', () => {
  it('returns the CSSObject as-is when style has no getStyles', () => {
    const style = { color: 'red', fontSize: 14 }
    const { result } = renderHook(() => useStyle(style), { wrapper })
    expect(result.current).toEqual(style)
  })

  it('calls getStyles with the current theme and returns the result', () => {
    const style = { getStyles: (theme: typeof dark) => ({ color: theme.text.primary }) }
    const { result } = renderHook(() => useStyle(style), { wrapper })
    expect(result.current).toEqual({ color: dark.text.primary })
  })
})
