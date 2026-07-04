import { describe, it, expect } from 'vitest'
import { stripReadmeChrome } from './utils'

describe('stripReadmeChrome', () => {
  it('strips a leading H1, badge block, and surrounding blank lines', () => {
    const readme = [
      '# @soroush.tech/pkg',
      '',
      '[![npm version](https://img/v.svg)](https://npm)',
      '[![license](https://img/l.svg)](./LICENSE)',
      '',
      'A useful plugin.',
      '',
      '## Install',
    ].join('\n')

    expect(stripReadmeChrome(readme)).toBe(['A useful plugin.', '', '## Install'].join('\n'))
  })

  it('trims blank lines that precede the H1', () => {
    expect(stripReadmeChrome('\n\n# Title\n\nBody')).toBe('Body')
  })

  it('leaves content untouched when there is no leading H1', () => {
    const body = 'Just prose.\n\n## Section'
    expect(stripReadmeChrome(body)).toBe(body)
  })

  it('keeps `##` headings, only stripping the `#` title', () => {
    expect(stripReadmeChrome('# Title\n\n## Keep me')).toBe('## Keep me')
  })

  it('preserves a badge that appears later in the body', () => {
    const readme = '# Title\n\nIntro.\n\n[![later](x)](y)'
    expect(stripReadmeChrome(readme)).toBe('Intro.\n\n[![later](x)](y)')
  })

  it('returns an empty string for empty input', () => {
    expect(stripReadmeChrome('')).toBe('')
  })
})
