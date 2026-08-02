import { newGistId } from '../../../../../shared/ipc'
import { describeDraft } from './describeDraft'

describe('describeDraft', () => {
  it('names a draft by its staged description', () => {
    expect(
      describeDraft('abc123', {
        files: { 'notes.md': { status: 'modified', content: 'edited' } },
        description: 'A better one',
      })
    ).toEqual({ gistId: 'abc123', title: 'A better one', changeCount: 2 })
  })

  it("uses the gist's published description when nothing is staged over it", () => {
    expect(
      describeDraft(
        'abc123',
        { files: { 'notes.md': { status: 'modified', content: 'edited' } } },
        'Deploy notes'
      ).title
    ).toBe('Deploy notes')
  })

  it('prefers a staged description, since that is what the gist will be called', () => {
    expect(
      describeDraft('abc123', { files: {}, description: 'A better one' }, 'The old description')
        .title
    ).toBe('A better one')
  })

  it.each([
    ['is blank', '   '],
    ['is absent', null],
  ])('falls through when the published description %s', (_name, published) => {
    expect(
      describeDraft('abc123', { files: { 'notes.md': { status: 'deleted' } } }, published).title
    ).toBe('notes.md')
  })

  it('falls back to the files it touches', () => {
    expect(
      describeDraft('abc123', {
        files: {
          'notes.md': { status: 'modified', content: 'edited' },
          'todo.md': { status: 'deleted' },
        },
      })
    ).toEqual({ gistId: 'abc123', title: 'notes.md, todo.md', changeCount: 2 })
  })

  it.each([
    ['an empty description', ''],
    ['a blank one', '   '],
  ])('ignores %s and uses the filenames', (_name, description) => {
    expect(
      describeDraft('abc123', {
        files: { 'notes.md': { status: 'deleted' } },
        description,
      }).title
    ).toBe('notes.md')
  })

  it('counts the description as a change of its own', () => {
    expect(describeDraft('abc123', { files: {}, description: 'Only this' })).toEqual({
      gistId: 'abc123',
      title: 'Only this',
      changeCount: 1,
    })
  })

  it('marks the sandbox as a gist that does not exist yet', () => {
    expect(
      describeDraft(newGistId(), { files: { 'draft.md': { status: 'added', content: '' } } }).title
    ).toBe('New gist — draft.md')
  })

  it('has something to show even for a draft with nothing named', () => {
    expect(describeDraft('abc123', { files: {} }).title).toBe('Untitled')
  })
})
