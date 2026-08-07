import type { GistSummary } from '../../../../../shared/ipc'
import { toGistLabel } from './toGistLabel'

const gist = (description: string | null, filename = 'en.md'): GistSummary => ({
  id: 'abc123',
  description,
  filename,
  fileCount: 1,
  isPublic: false,
})

describe('toGistLabel', () => {
  it('calls a gist by its description', () => {
    expect(toGistLabel(gist('Rehydration'))).toBe('Rehydration')
  })

  it.each([
    ['no description at all', null],
    ['a description of nothing but spaces', '   '],
  ])('falls back to the first file for one with %s', (_case, description) => {
    expect(toGistLabel(gist(description))).toBe('en.md')
  })

  it('has a name for a gist with neither', () => {
    expect(toGistLabel(gist(null, ''))).toBe('Untitled gist')
  })
})
