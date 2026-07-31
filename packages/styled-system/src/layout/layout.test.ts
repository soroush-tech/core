import { describe, expect, it } from 'vitest'
import { layout } from './layout'

describe('layout', () => {
  it('converts fractional widths to percentages', () => {
    expect(layout({ width: 0.5 })).toEqual({ width: '50%' })
  })

  it('passes through widths greater than one and non-numbers', () => {
    expect(layout({ width: 100 })).toEqual({ width: 100 })
    expect(layout({ width: 'auto' })).toEqual({ width: 'auto' })
  })

  it('resolves width from the sizes scale', () => {
    expect(layout({ width: 'half', theme: { sizes: { half: '50%' } } })).toEqual({ width: '50%' })
  })

  it('supports raw props', () => {
    expect(layout({ display: 'flex' })).toEqual({ display: 'flex' })
  })

  it('passes aspect-ratio through untouched (absent upstream)', () => {
    expect(layout({ aspectRatio: '1 / 1' })).toEqual({ aspectRatio: '1 / 1' })
    expect(layout({ aspectRatio: '16 / 9' })).toEqual({ aspectRatio: '16 / 9' })
  })
})
