import { describe, it, expect } from 'vitest'
import { baseTheme } from '../themes'
import { createTheme } from './createTheme'

describe('createTheme', () => {
  it('merges a sparse nested patch and keeps sibling fields', () => {
    const theme = createTheme(baseTheme, { palette: { primary: { main: '#123456' } } })
    expect(theme.palette.primary.main).toBe('#123456')
    expect(theme.palette.primary.contrastText).toBe(baseTheme.palette.primary.contrastText)
    expect(theme.palette.error).toEqual(baseTheme.palette.error)
  })

  it('replaces scalar values', () => {
    const theme = createTheme(baseTheme, { blur: '4px', name: 'custom' })
    expect(theme.blur).toBe('4px')
    expect(theme.name).toBe('custom')
  })

  it('replaces arrays wholesale instead of merging them', () => {
    const shadows = ['none']
    const theme = createTheme(baseTheme, { shadows })
    expect(theme.shadows).toEqual(['none'])
    expect(theme.shadows).toHaveLength(1)
  })

  it('replaces function values wholesale', () => {
    const spacing = (n: number) => `${4 * n}px`
    const theme = createTheme(baseTheme, { spacing } as Parameters<typeof createTheme>[1])
    expect((theme as typeof baseTheme & { spacing: typeof spacing }).spacing).toBe(spacing)
  })

  it('ignores undefined override values', () => {
    const theme = createTheme(baseTheme, { blur: undefined, palette: { primary: undefined } })
    expect(theme.blur).toBe(baseTheme.blur)
    expect(theme.palette.primary).toEqual(baseTheme.palette.primary)
  })

  it('does not mutate the base or the overrides', () => {
    const overrides = { palette: { primary: { main: '#123456' } } }
    createTheme(baseTheme, overrides)
    expect(baseTheme.palette.primary.main).not.toBe('#123456')
    expect(overrides).toEqual({ palette: { primary: { main: '#123456' } } })
  })

  it('keeps referential identity of untouched branches', () => {
    const theme = createTheme(baseTheme, { palette: { primary: { main: '#123456' } } })
    expect(theme.background).toBe(baseTheme.background)
    expect(theme.typography).toBe(baseTheme.typography)
  })

  it('adds keys that do not exist on the base', () => {
    const theme = createTheme(baseTheme, {
      background: { tertiary: '#0f0f0f' },
    } as Parameters<typeof createTheme>[1])
    expect((theme.background as Record<string, string>).tertiary).toBe('#0f0f0f')
    expect(theme.background.primary).toBe(baseTheme.background.primary)
  })
})
