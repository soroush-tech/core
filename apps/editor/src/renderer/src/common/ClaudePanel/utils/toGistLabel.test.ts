import { toGistLabel } from './toGistLabel'

const gist = (description: string | null, fileCount = 1) => ({
  id: 'abc123',
  description,
  fileCount,
  isPublic: false,
})

describe('toGistLabel', () => {
  it('calls a gist by its description', () => {
    expect(toGistLabel(gist('Rehydration'))).toBe('Rehydration')
  })

  it.each([
    ['no description at all', null, 1, 'Untitled · 1 file'],
    ['a description of nothing but spaces', '   ', 3, 'Untitled · 3 files'],
  ])('names one with %s by what it holds', (_case, description, fileCount, expected) => {
    expect(toGistLabel(gist(description, fileCount))).toBe(expected)
  })
})
