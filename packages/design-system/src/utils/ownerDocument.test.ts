import { describe, it, expect } from 'vitest'
import { ownerDocument } from './ownerDocument'

describe('ownerDocument', () => {
  it('returns the global document when the node is null', () => {
    expect(ownerDocument(null)).toBe(document)
  })

  it('returns the global document when the node is undefined', () => {
    expect(ownerDocument(undefined)).toBe(document)
  })

  it("returns the node's ownerDocument when present", () => {
    const node = document.createElement('div')
    expect(ownerDocument(node)).toBe(document)
  })
})
