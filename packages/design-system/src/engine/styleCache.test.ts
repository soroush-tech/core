import { describe, it, expect } from 'vitest'
import styleCache from './styleCache'

describe('styleCache', () => {
  it('has key "soroush"', () => {
    expect(styleCache.key).toBe('soroush')
  })

  it('exposes an inserted map and a sheet', () => {
    expect(styleCache).toHaveProperty('inserted')
    expect(styleCache).toHaveProperty('sheet')
  })
})
