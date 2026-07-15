import { describe, it, expect } from 'vitest'
import { getScrollbarSize } from './getScrollbarSize'

const makeWindow = (innerWidth: number, clientWidth: number) =>
  ({
    innerWidth,
    document: { documentElement: { clientWidth } },
  }) as unknown as Window

describe('getScrollbarSize', () => {
  it('returns the difference between innerWidth and clientWidth', () => {
    expect(getScrollbarSize(makeWindow(1024, 1009))).toBe(15)
  })

  it('returns 0 when there is no scrollbar', () => {
    expect(getScrollbarSize(makeWindow(1024, 1024))).toBe(0)
  })

  it('never returns a negative value', () => {
    expect(getScrollbarSize(makeWindow(1000, 1024))).toBe(24)
  })
})
