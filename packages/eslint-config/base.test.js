import { describe, expect, it } from 'vitest'
import base from './base.js'

describe('eslint base config', () => {
  it('exports a non-empty flat-config array', () => {
    expect(Array.isArray(base)).toBe(true)
    expect(base.length).toBeGreaterThan(0)
  })

  it('bans extensions in import paths', () => {
    const ruleSets = base.flatMap((entry) => (entry.rules ? [entry.rules] : []))
    expect(ruleSets.some((rules) => 'no-restricted-syntax' in rules)).toBe(true)
  })

  it('leaves formatting to oxfmt', () => {
    const ruleSets = base.flatMap((entry) => (entry.rules ? [entry.rules] : []))
    expect(ruleSets.some((rules) => 'prettier/prettier' in rules)).toBe(false)
  })
})
