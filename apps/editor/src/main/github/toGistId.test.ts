import { toGistId, toNewGistId } from './toGistId'

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

describe('toNewGistId', () => {
  it.each([
    ['a sandbox of its own', 'new:3f2504e0-4f89-41d3-9a0c-0305e82c3301'],
    ['one in capitals', 'NEW:3F2504E0-4F89-41D3-9A0C-0305E82C3301'],
    ['the shared sandbox drafts were once kept under', 'new'],
  ])('hands back %s', (_name, id) => {
    expect(toNewGistId(id)).toBe(id)
  })

  it.each([
    ['a path wearing the prefix', 'new:../../evil'],
    ['a prefix with nothing behind it', 'new:'],
    ['something that merely starts with the word', 'newspaper'],
    ['a published gist id', 'aa5a315d61ae9438b18d'],
    ['nothing at all', ''],
  ])('has nothing to hand back for %s', (_name, id) => {
    expect(toNewGistId(id)).toBeNull()
  })
})
