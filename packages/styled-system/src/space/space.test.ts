import { describe, expect, it } from 'vitest'
import { gap, margin, padding, space } from './space'

describe('space', () => {
  it('resolves padding from the scale', () => {
    expect(padding({ p: 2, theme: { space: [0, 4, 8, 16] } })).toEqual({ padding: 8 })
  })

  it('composes margin, padding and gap with shorthands', () => {
    expect(space({ m: 1, p: 1, gap: 1, theme: { space: [0, 4] } })).toEqual({
      margin: 4,
      padding: 4,
      gap: 4,
    })
  })

  // Not in upstream styled-system - gaps resolve against the same scale as margins.
  describe('gaps', () => {
    it('resolves gap, rowGap and columnGap from the scale', () => {
      expect(gap({ gap: 1, rowGap: 2, columnGap: 3, theme: { space: [0, 4, 8, 16] } })).toEqual({
        gap: 4,
        rowGap: 8,
        columnGap: 16,
      })
    })

    it('falls back to the default scale without a theme', () => {
      expect(gap({ gap: 2 })).toEqual({ gap: 8 })
    })

    it('passes through raw CSS values', () => {
      expect(gap({ gap: '1.5rem' })).toEqual({ gap: '1.5rem' })
    })

    it('resolves responsive arrays to media queries', () => {
      expect(gap({ gap: [1, 2], theme: { space: [0, 4, 8], breakpoints: ['40em'] } })).toEqual({
        gap: 4,
        '@media screen and (min-width: 40em)': { gap: 8 },
      })
    })
  })

  describe('negative margins', () => {
    it('negates a numeric scale value', () => {
      expect(margin({ m: -1, theme: { space: [0, 4] } })).toEqual({ margin: -4 })
    })

    it('prefixes a non-numeric scale value with a minus', () => {
      expect(margin({ m: -1, theme: { space: [0, '1rem'] } })).toEqual({ margin: '-1rem' })
    })

    it('keeps a non-numeric scale value unchanged for positive indices', () => {
      expect(margin({ m: 1, theme: { space: [0, 'auto'] } })).toEqual({ margin: 'auto' })
    })

    it('passes through non-number values', () => {
      expect(margin({ m: 'auto' })).toEqual({ margin: 'auto' })
    })
  })
})
