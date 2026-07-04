import { describe, it, expect } from 'vitest'
import { toEntry, packages } from './PackageIndex.data'

const pkg = {
  name: '@soroush.tech/example',
  description: 'An example package.',
  version: '1.2.3',
  keywords: ['a', 'b'],
}

describe('PackageIndex.data', () => {
  describe('toEntry', () => {
    it('links to the internal detail route, same tab, when a page exists', () => {
      const entry = toEntry(pkg, true)
      expect(entry.href).toBe('/example/')
      expect(entry.target).toBeUndefined()
    })

    it('links to the npm page in a new tab when no page exists', () => {
      const entry = toEntry(pkg, false)
      expect(entry.href).toBe('https://www.npmjs.com/package/@soroush.tech/example')
      expect(entry.target).toBe('_blank')
    })

    it('carries name, description, version, and keywords through', () => {
      expect(toEntry(pkg, true)).toMatchObject({
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        keywords: pkg.keywords,
      })
    })
  })

  it('discovers published @soroush.tech packages, excluding private ones', () => {
    expect(packages.length).toBeGreaterThan(0)
    expect(packages.some((p) => p.name === '@soroush.tech/vite-plugin-msw-server')).toBe(true)
    expect(packages.every((p) => p.name.startsWith('@soroush.tech/'))).toBe(true)
  })
})
