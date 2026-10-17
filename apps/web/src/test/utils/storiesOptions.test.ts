import { describe, it, expect } from 'vitest'
import { dark } from 'src/theme/themes'
import {
  fontFamilyTokens,
  fontSizeIndices,
  letterSpacingTokens,
  spaceTokens,
  textColorTokens,
  typographyVariantTokens,
} from './storiesOptions'

describe('storiesOptions', () => {
  it('offers the theme scales as token lists', () => {
    expect(typographyVariantTokens).toEqual(Object.keys(dark.typography))
    expect(textColorTokens).toEqual(Object.keys(dark.text))
    expect(fontFamilyTokens).toEqual(Object.keys(dark.fonts))
    expect(letterSpacingTokens).toEqual(Object.keys(dark.letterSpacings))
    expect(fontSizeIndices).toEqual(dark.fontSizes.map((_, i) => i))
  })

  it('offers space steps as numbers, and auto as is', () => {
    expect(spaceTokens).toContain('auto')
    expect(spaceTokens.filter((token) => token !== 'auto').every(Number.isFinite)).toBe(true)
  })
})
