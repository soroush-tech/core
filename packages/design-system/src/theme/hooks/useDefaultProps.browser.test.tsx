import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ThemeProvider } from '../ThemeProvider'
import { useDefaultProps } from './useDefaultProps'

// jsdom-tier tests already cover this hook via useDefaultProps.test.tsx, but the
// browser tier loads it (through the theme barrel) without any consumer calling it —
// this keeps the hook's own coverage complete in the browser tier too.
describe('useDefaultProps (browser)', () => {
  it('returns an empty object when the theme has no components config', () => {
    const { result } = renderHook(() => useDefaultProps('Button'), { wrapper: ThemeProvider })
    expect(result.current).toEqual({})
  })
})
