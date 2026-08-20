import { describe, it, expect } from 'vitest'
import { slugOf, toEntry, packages } from './PackageIndex.data'

const pkg = {
  name: '@soroush.tech/example',
  description: 'An example package.',
  version: '1.2.3',
  keywords: ['a', 'b'],
}

describe('PackageIndex.data', () => {
  describe('slugOf', () => {
    it('strips the scope from a scoped name', () => {
      expect(slugOf('@soroush.tech/design-system')).toBe('design-system')
    })

    it('leaves an unscoped name alone', () => {
      expect(slugOf('oxfmt-quick')).toBe('oxfmt-quick')
    })
  })

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

  it('discovers published workspace packages, excluding private ones', () => {
    expect(packages.length).toBeGreaterThan(0)
    expect(packages.some((p) => p.name === '@soroush.tech/vite-plugin-msw-server')).toBe(true)
    expect(packages.some((p) => p.name === '@soroush.tech/eslint-config')).toBe(false)
  })

  it('includes packages published from their own repository', () => {
    const entry = packages.find((p) => p.name === 'oxfmt-quick')
    expect(entry).toBeDefined()
    // Metadata comes from the installed package, so these are whatever it actually publishes.
    expect(entry?.description).toBeTruthy()
    expect(entry?.version).toMatch(/^\d+\.\d+\.\d+/)
    expect(entry?.keywords.length).toBeGreaterThan(0)
  })

  it('includes ai-watermark-guard, which also ships from its own repository', () => {
    const entry = packages.find((p) => p.name === 'ai-watermark-guard')
    expect(entry).toBeDefined()
    expect(entry?.href).toBe('/ai-watermark-guard/')
    expect(entry?.target).toBeUndefined()
  })

  it('links an unscoped package to its own detail page, not to npm', () => {
    const entry = packages.find((p) => p.name === 'oxfmt-quick')
    expect(entry?.href).toBe('/oxfmt-quick/')
    expect(entry?.target).toBeUndefined()
  })
})
