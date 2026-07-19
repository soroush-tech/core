import { createElement } from 'react'
import { describe, it, expect } from 'vitest'
import { isMermaidBlock, mermaidSource } from './mermaidBlock'

describe('mermaidSource', () => {
  it('returns a string child, dropping the trailing newline', () => {
    expect(mermaidSource('graph TD; A-->B\n')).toBe('graph TD; A-->B')
  })

  it('joins array children', () => {
    expect(mermaidSource(['graph TD;', ' A-->B'])).toBe('graph TD; A-->B')
  })

  it('treats a nullish child as empty', () => {
    expect(mermaidSource(null)).toBe('')
  })
})

describe('isMermaidBlock', () => {
  it('is true for a code element with the mermaid language class', () => {
    expect(isMermaidBlock(createElement('code', { className: 'language-mermaid' }))).toBe(true)
  })

  it('is false for a code element of another language', () => {
    expect(isMermaidBlock(createElement('code', { className: 'language-js' }))).toBe(false)
  })

  it('is false for an element without a className', () => {
    expect(isMermaidBlock(createElement('code'))).toBe(false)
  })

  it('is false for a non-element child', () => {
    expect(isMermaidBlock('graph TD; A-->B')).toBe(false)
  })
})
