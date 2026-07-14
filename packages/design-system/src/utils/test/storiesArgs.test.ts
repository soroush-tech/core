import { describe, it, expect } from 'vitest'
import * as storiesArgs from './storiesArgs'

describe('storiesArgs', () => {
  it('every export has control, description and table.category', () => {
    for (const [key, arg] of Object.entries(storiesArgs)) {
      expect(arg, key).toHaveProperty('control')
      expect(arg, key).toHaveProperty('description')
      expect(arg, key).toHaveProperty('table.category')
    }
  })
})
