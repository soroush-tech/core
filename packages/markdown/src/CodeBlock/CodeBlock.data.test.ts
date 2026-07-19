import { describe, it, expect } from 'vitest'
import { syntaxDark, syntaxLight } from './CodeBlock.data'

describe('CodeBlock syntax presets', () => {
  it.each([
    ['syntaxDark', syntaxDark],
    ['syntaxLight', syntaxLight],
  ])('%s supplies every ThemeSyntax token', (_name, preset) => {
    expect(Object.keys(preset).sort()).toEqual(
      [
        'base',
        'comment',
        'constant',
        'font',
        'keyword',
        'number',
        'string',
        'tag',
        'title',
        'type',
      ].sort()
    )
    Object.values(preset).forEach((value) => expect(typeof value).toBe('string'))
  })

  it('shares the same font stack between presets', () => {
    expect(syntaxDark.font).toBe(syntaxLight.font)
  })
})
