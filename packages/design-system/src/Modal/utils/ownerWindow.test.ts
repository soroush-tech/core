import { describe, it, expect, afterEach, vi } from 'vitest'
import { ownerWindow } from './ownerWindow'

describe('ownerWindow', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the global window when the node is null', () => {
    expect(ownerWindow(null)).toBe(window)
  })

  it("returns the document's defaultView when present", () => {
    const node = document.createElement('div')
    expect(ownerWindow(node)).toBe(window)
  })

  it('falls back to the global window when defaultView is null', () => {
    const node = document.createElement('div')
    vi.spyOn(node, 'ownerDocument', 'get').mockReturnValue({
      defaultView: null,
    } as unknown as Document)
    expect(ownerWindow(node)).toBe(window)
  })
})
