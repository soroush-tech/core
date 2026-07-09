import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { MenuItem } from 'src/theme/MenuItem'
import { getOptionsFromChildren } from './getOptionsFromChildren'

describe('getOptionsFromChildren', () => {
  it('maps MenuItem children to value/label/disabled', () => {
    const options = getOptionsFromChildren([
      createElement(MenuItem, { key: 'a', value: 1 }, 'One'),
      createElement(MenuItem, { key: 'b', value: 'two', disabled: true }, 'Two'),
    ])
    expect(options).toEqual([
      { value: 1, label: 'One', disabled: false },
      { value: 'two', label: 'Two', disabled: true },
    ])
  })

  it('skips non-element and value-less children', () => {
    const options = getOptionsFromChildren([
      'plain text',
      null,
      createElement('span', { key: 's' }, 'no value'),
      createElement(MenuItem, { key: 'a', value: 1 }, 'One'),
    ])
    expect(options).toEqual([{ value: 1, label: 'One', disabled: false }])
  })
})
