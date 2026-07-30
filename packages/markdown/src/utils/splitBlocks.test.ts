import { describe, expect, it } from 'vitest'
import { splitBlocks } from './splitBlocks'

describe('splitBlocks', () => {
  it('returns no blocks for an empty or blank document', () => {
    expect(splitBlocks('')).toEqual([])
    expect(splitBlocks('\n  \n\n')).toEqual([])
  })

  it('splits paragraphs on blank lines with exact offsets', () => {
    const value = '# Title\n\nFirst paragraph.\n\n\nSecond one.'
    expect(splitBlocks(value)).toEqual([
      { source: '# Title', start: 0, end: 7 },
      { source: 'First paragraph.', start: 9, end: 25 },
      { source: 'Second one.', start: 28, end: 39 },
    ])
  })

  // Each of these must come back as exactly one block spanning the whole
  // document. The reasons differ, so each case carries its own name.
  it.each([
    ['consecutive non-blank lines stay together', '- one\n- two\n- three'],
    [
      'a marker of the other character does not close a fence',
      '```\ntilde block\n~~~\n\nstill inside\n```',
    ],
    [
      // ```ts is an opening-style marker, so inside an open fence it is content —
      // closing there would let the blank line below split the block in two.
      'a marker carrying an info string does not close a fence',
      '```\ncode\n```ts\n\nstill inside\n```',
    ],
  ])('keeps the document as a single block when %s', (_reason, value) => {
    expect(splitBlocks(value)).toEqual([{ source: value, start: 0, end: value.length }])
  })

  it('ignores leading and trailing blank lines', () => {
    const value = '\n\nOnly block\n\n'
    expect(splitBlocks(value)).toEqual([{ source: 'Only block', start: 2, end: 12 }])
  })

  it('keeps blank lines inside a fenced code block', () => {
    const value = 'Intro\n\n```js\nconst a = 1\n\nconst b = 2\n```\n\nOutro'
    expect(splitBlocks(value).map((block) => block.source)).toEqual([
      'Intro',
      '```js\nconst a = 1\n\nconst b = 2\n```',
      'Outro',
    ])
  })

  it('supports ~~~ fences and longer closing markers', () => {
    const value = '~~~\ntext\n\nmore\n~~~~\n\nAfter'
    expect(splitBlocks(value).map((block) => block.source)).toEqual([
      '~~~\ntext\n\nmore\n~~~~',
      'After',
    ])
  })

  it('treats an unclosed fence as running to the end', () => {
    const value = 'Before\n\n```\nno closing\n\nstill code'
    expect(splitBlocks(value).map((block) => block.source)).toEqual([
      'Before',
      '```\nno closing\n\nstill code',
    ])
  })

  it('round-trips: splicing an unchanged block back reproduces the document', () => {
    const value = '# A\n\ntext body\n\n```\ncode\n\ncode\n```\n'
    for (const block of splitBlocks(value)) {
      expect(value.slice(0, block.start) + block.source + value.slice(block.end)).toBe(value)
    }
  })
})
