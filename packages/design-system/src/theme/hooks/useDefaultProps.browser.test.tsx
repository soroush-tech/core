import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ThemeProvider } from '../ThemeProvider'
import { createTheme, baseTheme } from '../themes'
import { useDefaultProps } from './useDefaultProps'

// jsdom-tier tests already cover this hook via useDefaultProps.test.tsx, but the
// browser tier loads it (through the theme barrel) without any consumer calling it.
// Mirror the full jsdom case set: the tiers' merged V8 reports don't always share
// statement segments, so each tier must reach 100% on its own.
describe('useDefaultProps (browser)', () => {
  it('returns an empty object when the theme has no components config', () => {
    const { result } = renderHook(() => useDefaultProps('Button'), { wrapper: ThemeProvider })
    expect(result.current).toEqual({})
  })

  it('returns an empty object when the component entry has no defaultProps', () => {
    const theme = createTheme(baseTheme, { components: { Button: { styleOverrides: {} } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useDefaultProps('Button'), { wrapper })
    expect(result.current).toEqual({})
  })

  it('returns the theme-contributed default props', () => {
    const theme = createTheme(baseTheme, {
      components: { Button: { defaultProps: { size: 'sm', shape: 'rounded' } } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useDefaultProps('Button'), { wrapper })
    expect(result.current).toEqual({ size: 'sm', shape: 'rounded' })
  })
})
