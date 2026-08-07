import { CONTEXT_LIMIT, toContext } from './toContext'

const file = (filename: string, content: string) => ({ filename, content })

describe('toContext', () => {
  it('lays the gist out as a document, description first', () => {
    expect(
      toContext('Rehydration', [file('en.md', '# Part one'), file('notes.md', 'asides')])
    ).toEqual({
      text: '# Rehydration\n\n## en.md\n# Part one\n\n## notes.md\nasides',
      isTrimmed: false,
    })
  })

  it.each([
    ['no description', null],
    ['a blank one', '   '],
  ])('starts at the files when the gist has %s', (_name, description) => {
    expect(toContext(description, [file('en.md', '# Part one')]).text).toBe('## en.md\n# Part one')
  })

  it('has nothing to say about a gist with no files and no description', () => {
    expect(toContext(null, [])).toEqual({ text: '', isTrimmed: false })
  })

  it('sends only the first part of a gist too long to be worth reading whole', () => {
    const context = toContext(null, [file('en.md', 'x'.repeat(CONTEXT_LIMIT * 2))])

    expect(context.isTrimmed).toBe(true)
    expect(context.text).toHaveLength(CONTEXT_LIMIT)
  })
})
