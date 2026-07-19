import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ThemeProvider } from '../ThemeProvider'
import { baseTheme } from '../themes'
import { useTheme } from './useTheme'

// jsdom-tier tests already cover this hook via ThemeProvider.test.tsx, but Modal is
// the only *.browser.test.* consumer of ThemeProvider and never calls useTheme
// itself — this keeps the hook's own coverage complete in the browser tier too.
describe('useTheme (browser)', () => {
  it('returns the active theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(result.current.name).toBe(baseTheme.name)
  })
})
