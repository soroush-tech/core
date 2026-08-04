import { toGistId } from './toGistId'

describe('toGistId', () => {
  it.each([
    ['a gist id', 'aa5a315d61ae9438b18d'],
    ['one in capitals', 'AA5A315D61AE9438B18D'],
  ])('hands back %s', (_name, id) => {
    expect(toGistId(id)).toBe(id)
  })

  it.each([
    ['a path of its own', '../../evil'],
    ['a query string', 'abc123?x=1'],
    ['a whole URL', 'https://example.com/abc123'],
    ['the sandbox id of a gist that does not exist yet', 'new:1234'],
    ['letters that are not hexadecimal', 'zzzzz'],
    ['nothing at all', ''],
    ['something far too long', 'a'.repeat(65)],
  ])('has nothing to hand back for %s', (_name, id) => {
    expect(toGistId(id)).toBeNull()
  })
})
