import { describe, it, expect } from 'vitest'
import { hero } from './ai-watermark-guard.data'

describe('ai-watermark-guard.data', () => {
  it('names the unscoped package and describes it', () => {
    expect(hero.name).toBe('ai-watermark-guard')
    expect(hero.tagline).toBeTruthy()
  })

  it('installs the package by its own name', () => {
    expect(hero.install).toContain(hero.name)
  })

  it('points npm at the unscoped name', () => {
    expect(hero.npmUrl).toBe(`https://www.npmjs.com/package/${hero.name}`)
  })

  it('points the source link at its own repository, not the monorepo', () => {
    expect(hero.repoUrl).toBe('https://github.com/soroush-tech/ai-watermark-guard')
    expect(hero.repoUrl).not.toContain('/packages/')
  })

  it('names the implementation and the number behind the speed claim', () => {
    expect(hero.tagline).toContain('Rust')
    // A measured figure, not an adjective: if the tagline ever says "blazing fast" instead,
    // this fails and someone has to go and measure it again.
    expect(hero.tagline).toMatch(/[0-9]+ *ms/)
  })

  it('says what it finds without promising to defeat a detector', () => {
    expect(hero.tagline).not.toMatch(/detector|undetectable|bypass/i)
  })
})
