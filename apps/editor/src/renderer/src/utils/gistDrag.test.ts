import { GIST_DRAG_TYPE, isGistDrag, readGistDrag, startGistDrag } from './gistDrag'

/** Enough of a DataTransfer to carry one payload. */
function createDataTransfer(entries: Record<string, string> = {}): DataTransfer {
  const data = { ...entries }
  return {
    types: Object.keys(data),
    effectAllowed: 'none',
    setData: (type: string, value: string) => {
      data[type] = value
    },
    getData: (type: string) => data[type] ?? '',
  } as unknown as DataTransfer
}

describe('startGistDrag', () => {
  it('carries the gist under its own type, as a reference rather than a move', () => {
    const dataTransfer = createDataTransfer()

    startGistDrag(dataTransfer, 'abc123')

    expect(dataTransfer.getData(GIST_DRAG_TYPE)).toBe('abc123')
    expect(dataTransfer.effectAllowed).toBe('link')
  })
})

describe('isGistDrag', () => {
  it.each([
    ['a gist from this app', { [GIST_DRAG_TYPE]: 'abc123' }, true],
    ['dragged text', { 'text/plain': 'hello' }, false],
    ['nothing recognisable', {}, false],
  ])('reports %s as %s', (_name, entries, expected) => {
    expect(isGistDrag(createDataTransfer(entries))).toBe(expected)
  })
})

describe('readGistDrag', () => {
  it('reads the dragged gist', () => {
    expect(readGistDrag(createDataTransfer({ [GIST_DRAG_TYPE]: 'abc123' }))).toBe('abc123')
  })

  it('has nothing to read from a drag carrying something else', () => {
    expect(readGistDrag(createDataTransfer({ 'text/plain': 'hello' }))).toBeNull()
  })
})
