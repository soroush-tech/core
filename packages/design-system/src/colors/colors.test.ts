import { describe, test, expect } from 'vitest'
import path from 'path'
import * as colors from './index'

type ShadeKey = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
const expectedKeys: ShadeKey[] = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

for (const [name, getter] of Object.entries(colors)) {
  const filePath = path.join(__dirname, name)
  const palette = await import(filePath)
  describe(`palette ${name} validation`, () => {
    test('includes required shades', () => {
      expect(palette[name]).toHaveProperty('base')
      for (const key of expectedKeys) {
        expect(palette[name]).toHaveProperty(key)
      }
    })

    test(`valid color shade for palette ${name}`, () => {
      for (const value of Object.values(getter)) {
        expect(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)).toBe(true)
      }
    })

    test('includes notes for each shade', () => {
      expect(palette).toHaveProperty('_notes')
      for (const key of Object.keys(getter)) {
        if (key === 'base') {
          continue
        }
        expect(palette._notes).toHaveProperty(key)
      }
    })

    test('includes shade for each pallet', () => {
      for (const key of Object.keys(palette._notes)) {
        expect(getter).toHaveProperty(key)
      }
    })

    test(`${name} has valid title`, () => {
      expect(typeof palette._title).toBe('string')
    })

    test(`${name} has valid description`, () => {
      expect(typeof palette._description).toBe('string')
    })
  })
}
