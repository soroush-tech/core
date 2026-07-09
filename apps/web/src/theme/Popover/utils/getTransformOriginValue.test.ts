import { describe, it, expect } from 'vitest'
import { getTransformOriginValue } from './getTransformOriginValue'

describe('getTransformOriginValue', () => {
  it('serializes the resolved origin as a horizontal/vertical px pair', () => {
    expect(getTransformOriginValue({ vertical: 5, horizontal: 10 })).toBe('10px 5px')
  })
})
