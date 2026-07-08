import { describe, it, expect } from 'vitest'
import { isOptionSelected } from './isOptionSelected'

describe('isOptionSelected', () => {
  it('matches a single value by equality', () => {
    expect(isOptionSelected(2, 2)).toBe(true)
    expect(isOptionSelected(2, 3)).toBe(false)
  })

  it('checks array membership in multiple mode', () => {
    expect(isOptionSelected([1, 3], 3)).toBe(true)
    expect(isOptionSelected([1, 3], 2)).toBe(false)
    expect(isOptionSelected([], 1)).toBe(false)
  })
})
