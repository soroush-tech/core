import { describe, it, expect } from 'vitest'
import { resolveAnchorEl } from './resolveAnchorEl'

describe('resolveAnchorEl', () => {
  it('returns an element directly', () => {
    const el = document.createElement('div')
    expect(resolveAnchorEl(el)).toBe(el)
  })
  it('calls a function anchor and returns its result', () => {
    const el = document.createElement('div')
    expect(resolveAnchorEl(() => el)).toBe(el)
  })
  it('normalizes null / nullish results to null', () => {
    expect(resolveAnchorEl(null)).toBeNull()
    expect(resolveAnchorEl(() => null)).toBeNull()
  })
})
