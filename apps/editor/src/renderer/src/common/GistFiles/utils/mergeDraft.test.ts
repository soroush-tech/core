import { mergeDraft } from './mergeDraft'

const FILES = [
  { filename: 'notes.md', content: '# notes' },
  { filename: 'todo.md', content: '# todo' },
]

describe('mergeDraft', () => {
  it('leaves published files unmarked when nothing is staged', () => {
    expect(mergeDraft(FILES, {})).toEqual([
      { filename: 'notes.md', content: '# notes', status: null },
      { filename: 'todo.md', content: '# todo', status: null },
    ])
  })

  it('shows local content for a modified file', () => {
    expect(mergeDraft(FILES, { 'notes.md': { status: 'modified', content: 'edited' } })[0]).toEqual(
      {
        filename: 'notes.md',
        content: 'edited',
        status: 'modified',
      }
    )
  })

  it('keeps a staged deletion in the list, with the published content', () => {
    expect(mergeDraft(FILES, { 'notes.md': { status: 'deleted' } })[0]).toEqual({
      filename: 'notes.md',
      content: '# notes',
      status: 'deleted',
    })
  })

  it('appends files that exist only locally', () => {
    const merged = mergeDraft(FILES, { 'draft.md': { status: 'added', content: '# new' } })

    expect(merged).toHaveLength(3)
    expect(merged[2]).toEqual({ filename: 'draft.md', content: '# new', status: 'added' })
  })

  it('keeps GitHub ordering for published files', () => {
    const merged = mergeDraft(FILES, {
      'draft.md': { status: 'added', content: '' },
      'todo.md': { status: 'modified', content: 'edited' },
    })

    expect(merged.map((file) => file.filename)).toEqual(['notes.md', 'todo.md', 'draft.md'])
  })

  it('ignores a deletion staged against a file the gist no longer has', () => {
    expect(mergeDraft(FILES, { 'ghost.md': { status: 'deleted' } })).toHaveLength(2)
  })

  it('handles a gist with no published files at all', () => {
    expect(mergeDraft([], { 'draft.md': { status: 'added', content: '' } })).toEqual([
      { filename: 'draft.md', content: '', status: 'added' },
    ])
  })
})
