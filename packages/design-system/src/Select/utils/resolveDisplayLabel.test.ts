import { describe, it, expect } from 'vitest'
import { type SelectOption } from './getOptionsFromChildren'
import { resolveDisplayLabel } from './resolveDisplayLabel'

const options: SelectOption[] = [
  { value: 1, label: 'One', disabled: false },
  { value: 2, label: 'Two', disabled: false },
  { value: 3, label: 'Three', disabled: false },
]

describe('resolveDisplayLabel', () => {
  it('returns the matching label in single mode', () => {
    expect(resolveDisplayLabel(options, 2)).toBe('Two')
  })

  it('returns null when the single value matches nothing', () => {
    expect(resolveDisplayLabel(options, 9)).toBeNull()
  })

  it('joins selected labels in option order for multiple mode', () => {
    expect(resolveDisplayLabel(options, [3, 1])).toEqual(['One', ', ', 'Three'])
  })

  it('returns null when the multiple selection is empty', () => {
    expect(resolveDisplayLabel(options, [])).toBeNull()
  })
})
