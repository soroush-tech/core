import { describe, it, expect } from 'vitest'
import { hero } from './markdown.data'

describe('markdown.data', () => {
  it('names the scoped package and describes it', () => {
    expect(hero.name).toBe('@soroush.tech/markdown')
    expect(hero.tagline).toBeTruthy()
  })

  it('installs the package by name', () => {
    expect(hero.install).toContain(hero.name)
  })

  it('points the npm and source links at this package', () => {
    expect(hero.npmUrl).toBe(`https://www.npmjs.com/package/${hero.name}`)
    expect(hero.repoUrl).toContain('/packages/markdown')
  })
})
