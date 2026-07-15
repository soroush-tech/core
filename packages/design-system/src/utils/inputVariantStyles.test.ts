import { describe, it, expect } from 'vitest'
import { baseTheme } from '../themes'
import { inputVariantStyles } from './inputVariantStyles'

const resolve = (variant: string) => inputVariantStyles({ variant, theme: baseTheme })

describe('inputVariantStyles', () => {
  it('resolves the outlined box: sq radius, thin border, solid style', () => {
    expect(resolve('outlined')).toEqual({
      borderRadius: baseTheme.radii.sq,
      borderWidth: baseTheme.borderWidths.thin,
      borderStyle: 'solid',
    })
  })

  it('renders default and text as borderless with the sq radius', () => {
    const borderless = { borderRadius: baseTheme.radii.sq, borderStyle: 'none' }
    expect(resolve('default')).toEqual(borderless)
    expect(resolve('text')).toEqual(borderless)
  })

  it('renders underline as a bottom-only border', () => {
    expect(resolve('underline')).toEqual({
      borderRadius: baseTheme.radii.sq,
      borderStyle: 'none',
      borderBottomWidth: baseTheme.borderWidths.thin,
      borderBottomStyle: 'solid',
    })
  })
})
