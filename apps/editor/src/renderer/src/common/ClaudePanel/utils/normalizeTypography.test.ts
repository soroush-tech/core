import { normalizeTypography } from './normalizeTypography'

/**
 * Fixtures are built from code points, not written as themselves: half of these
 * cannot be seen, and the repo-wide typography guard would rewrite the other
 * half - leaving a test that passes while proving nothing.
 */
const char = (point: number) => String.fromCodePoint(point)

describe('normalizeTypography', () => {
  it.each([
    ['zero-width space', 0x200b],
    ['word joiner', 0x2060],
    ['byte order mark', 0xfeff],
    ['soft hyphen', 0x00ad],
  ])('removes the %s', (_name, point) => {
    expect(normalizeTypography(`we${char(point)}ll`)).toBe('well')
  })

  it.each([
    ['no-break space', 0x00a0],
    ['narrow no-break space', 0x202f],
    ['thin space', 0x2009],
  ])('turns the %s into an ordinary one', (_name, point) => {
    expect(normalizeTypography(`10${char(point)}km`)).toBe('10 km')
  })

  it.each([
    ['curly double quotes', `${char(0x201c)}hi${char(0x201d)}`, '"hi"'],
    ['a low double quote', `${char(0x201e)}hi${char(0x201d)}`, '"hi"'],
    ['a curly apostrophe', `it${char(0x2019)}s`, "it's"],
    ['curly single quotes', `${char(0x2018)}hi${char(0x2019)}`, "'hi'"],
    ['a low single quote', `${char(0x201a)}hi${char(0x201b)}`, "'hi'"],
    ['an en dash', `pages 3${char(0x2013)}5`, 'pages 3-5'],
    ['a spaced em dash', `a ${char(0x2014)} b`, 'a - b'],
    ['an unspaced em dash', `a${char(0x2014)}b`, 'a-b'],
    ['a minus sign', `${char(0x2212)}40`, '-40'],
    ['an ellipsis', `wait${char(0x2026)}`, 'wait...'],
  ])('replaces %s', (_name, written, expected) => {
    expect(normalizeTypography(written)).toBe(expected)
  })

  // The whole point of the character list being a list rather than "everything
  // invisible": each of these carries meaning, and dropping it breaks the text.
  it.each([
    ['the zero-width non-joiner Persian needs inside a word', 0x200c],
    ['the zero-width joiner that holds an emoji sequence together', 0x200d],
    ['the left-to-right mark', 0x200e],
    ['the right-to-left mark', 0x200f],
  ])('keeps %s', (_name, point) => {
    const text = `a${char(point)}b`
    expect(normalizeTypography(text)).toBe(text)
  })

  it('leaves a line that is already plain exactly as it is', () => {
    const plain = "a 'plain' line - nothing here to do..."
    expect(normalizeTypography(plain)).toBe(plain)
  })
})
