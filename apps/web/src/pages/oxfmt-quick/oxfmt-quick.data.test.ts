import { describe, it, expect } from 'vitest'
import { hero } from './oxfmt-quick.data'

describe('oxfmt-quick.data', () => {
  it('names the unscoped package and describes it', () => {
    expect(hero.name).toBe('oxfmt-quick')
    expect(hero.tagline).toBeTruthy()
  })

  it('installs the package alongside its oxfmt peer', () => {
    expect(hero.install).toContain(hero.name)
    expect(hero.install).toContain('oxfmt ')
  })

  it('points npm at the unscoped name', () => {
    expect(hero.npmUrl).toBe(`https://www.npmjs.com/package/${hero.name}`)
  })

  it('points the source link at its own repository, not the monorepo', () => {
    expect(hero.repoUrl).toBe('https://github.com/soroush-tech/oxfmt-quick')
    expect(hero.repoUrl).not.toContain('/packages/')
  })
})
