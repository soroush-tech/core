import { describe, it, expect } from 'vitest'
import { computeNextValue } from './computeNextValue'

describe('computeNextValue', () => {
  it('replaces the value in single mode', () => {
    expect(computeNextValue(1, 2)).toBe(2)
    expect(computeNextValue('', 'a')).toBe('a')
  })

  it('adds an unselected value in multiple mode', () => {
    expect(computeNextValue([1], 2)).toEqual([1, 2])
  })

  it('removes an already-selected value in multiple mode', () => {
    expect(computeNextValue([1, 2, 3], 2)).toEqual([1, 3])
  })
})
