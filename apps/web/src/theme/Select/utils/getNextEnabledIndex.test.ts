import { describe, it, expect } from 'vitest'
import { type SelectOption } from './getOptionsFromChildren'
import { getNextEnabledIndex, getEdgeEnabledIndex } from './getNextEnabledIndex'

const opts = (disabled: boolean[]): SelectOption[] =>
  disabled.map((d, i) => ({ value: i, label: String(i), disabled: d }))

describe('getNextEnabledIndex', () => {
  it('moves forward to the next enabled option, skipping disabled ones', () => {
    expect(getNextEnabledIndex(opts([false, true, false]), 0, 1)).toBe(2)
  })

  it('moves backward to the previous enabled option', () => {
    expect(getNextEnabledIndex(opts([false, true, false]), 2, -1)).toBe(0)
  })

  it('stays put at the edge when no enabled option lies ahead', () => {
    expect(getNextEnabledIndex(opts([false, true, true]), 0, 1)).toBe(0)
    expect(getNextEnabledIndex(opts([false, false]), 1, 1)).toBe(1)
  })
})

describe('getEdgeEnabledIndex', () => {
  it('finds the first enabled option', () => {
    expect(getEdgeEnabledIndex(opts([true, false, false]), 'first')).toBe(1)
  })

  it('finds the last enabled option', () => {
    expect(getEdgeEnabledIndex(opts([true, true, false, false]), 'last')).toBe(3)
    expect(getEdgeEnabledIndex(opts([false, true, false]), 'last')).toBe(2)
  })

  it('returns -1 when every option is disabled', () => {
    expect(getEdgeEnabledIndex(opts([true, true]), 'first')).toBe(-1)
    expect(getEdgeEnabledIndex(opts([true, true]), 'last')).toBe(-1)
  })
})
