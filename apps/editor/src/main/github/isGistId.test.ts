import { isGistId } from './isGistId'

describe('isGistId', () => {
  it.each([
    ['a gist id', 'aa5a315d61ae9438b18d'],
    ['one in capitals', 'AA5A315D61AE9438B18D'],
  ])('accepts %s', (_name, id) => {
    expect(isGistId(id)).toBe(true)
  })

  it.each([
    ['a path of its own', '../../evil'],
    ['a query string', 'abc123?x=1'],
    ['a whole URL', 'https://example.com/abc123'],
    ['the sandbox id of a gist that does not exist yet', 'new:1234'],
    ['letters that are not hexadecimal', 'zzzzz'],
    ['nothing at all', ''],
    ['something far too long', 'a'.repeat(65)],
  ])('refuses %s', (_name, id) => {
    expect(isGistId(id)).toBe(false)
  })
})
