import { describe, it, expect } from 'vitest'
import { dark } from 'src/theme/themes'
import { inputVariantStyles } from './inputVariantStyles'

const resolve = (variant: string) => inputVariantStyles({ variant, theme: dark })

describe('inputVariantStyles', () => {
  it('resolves the outlined box: sq radius, thin border, solid style', () => {
    expect(resolve('outlined')).toEqual({
      borderRadius: dark.radii.sq,
      borderWidth: dark.borderWidths.thin,
      borderStyle: 'solid',
    })
  })

  it('renders default and text as borderless with the sq radius', () => {
    const borderless = { borderRadius: dark.radii.sq, borderStyle: 'none' }
    expect(resolve('default')).toEqual(borderless)
    expect(resolve('text')).toEqual(borderless)
  })

  it('renders underline as a bottom-only border', () => {
    expect(resolve('underline')).toEqual({
      borderRadius: dark.radii.sq,
      borderStyle: 'none',
      borderBottomWidth: dark.borderWidths.thin,
      borderBottomStyle: 'solid',
    })
  })
})
