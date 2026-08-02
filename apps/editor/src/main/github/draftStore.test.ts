import type { GistDraft } from '../../shared/ipc'
import { createDraftStore, isEmptyDraft, type DraftStore } from './draftStore'

const FILE = 'C:\\userData\\gist-drafts.json'
const DRAFT: GistDraft = { files: { 'notes.md': { status: 'modified', content: 'edited' } } }
const OTHER: GistDraft = { files: { 'other.md': { status: 'deleted' } } }

const io = { readFile: vi.fn(), writeFile: vi.fn(), rename: vi.fn() }

let store: DraftStore

/** The JSON the store would have found on disk. */
const onDisk = (drafts: Record<string, unknown>) =>
  io.readFile.mockResolvedValue(JSON.stringify(drafts))

/** What the store just wrote back. */
const written = () => JSON.parse(String(io.writeFile.mock.calls[0][1])) as Record<string, unknown>

beforeEach(() => {
  vi.clearAllMocks()
  io.writeFile.mockResolvedValue(undefined)
  io.rename.mockResolvedValue(undefined)
  store = createDraftStore(FILE, io)
})

describe('isEmptyDraft', () => {
  it.each([
    ['nothing staged', { files: {} }, true],
    ['a staged file', DRAFT, false],
    ['only a description', { files: {}, description: 'new' }, false],
    [
      'an emptied description, which still clears it on GitHub',
      { files: {}, description: '' },
      false,
    ],
  ])('reports %s', (_name, draft, expected) => {
    expect(isEmptyDraft(draft as GistDraft)).toBe(expected)
  })
})

describe('draftStore.read', () => {
  it('returns the draft for one gist', async () => {
    onDisk({ abc123: DRAFT, def456: OTHER })
    await expect(store.read('abc123')).resolves.toEqual(DRAFT)
  })

  it('keeps a staged description', async () => {
    onDisk({ abc123: { ...DRAFT, description: 'A better one' } })
    await expect(store.read('abc123')).resolves.toEqual({ ...DRAFT, description: 'A better one' })
  })

  it('reads a draft written before descriptions could be staged', async () => {
    // The old shape was a bare file map — that work should not be thrown away.
    onDisk({ abc123: { 'notes.md': { status: 'modified', content: 'edited' } } })
    await expect(store.read('abc123')).resolves.toEqual(DRAFT)
  })

  it('returns an empty draft for a gist with nothing staged', async () => {
    onDisk({ def456: OTHER })
    await expect(store.read('abc123')).resolves.toEqual({ files: {} })
  })

  it.each([
    ['there is no file yet', () => io.readFile.mockRejectedValue(new Error('ENOENT'))],
    ['the file will not parse', () => io.readFile.mockResolvedValue('not json')],
  ])('returns an empty draft when %s', async (_name, arrange) => {
    arrange()
    await expect(store.read('abc123')).resolves.toEqual({ files: {} })
  })
})

describe('draftStore.list', () => {
  it('returns every gist with something staged', async () => {
    onDisk({ abc123: DRAFT, def456: OTHER })
    await expect(store.list()).resolves.toEqual({ abc123: DRAFT, def456: OTHER })
  })

  it('reads drafts written before descriptions could be staged', async () => {
    onDisk({ abc123: { 'notes.md': { status: 'modified', content: 'edited' } } })
    await expect(store.list()).resolves.toEqual({ abc123: DRAFT })
  })

  it('leaves out a husk with nothing in it', async () => {
    // An interrupted write can leave an emptied entry; it is not work to return to.
    onDisk({ abc123: DRAFT, husk: { files: {} } })
    await expect(store.list()).resolves.toEqual({ abc123: DRAFT })
  })

  it('is empty when there is no file yet', async () => {
    io.readFile.mockRejectedValue(new Error('ENOENT'))
    await expect(store.list()).resolves.toEqual({})
  })
})

describe('draftStore.update', () => {
  it('hands the change the draft as it is on disk, and stores what it returns', async () => {
    onDisk({ def456: OTHER })

    await expect(store.update('abc123', () => DRAFT)).resolves.toEqual({
      success: true,
      data: DRAFT,
    })
    expect(written()).toEqual({ def456: OTHER, abc123: DRAFT })
  })

  it('changes the draft that is already staged, rather than replacing it blind', async () => {
    onDisk({ abc123: DRAFT })

    await store.update('abc123', (draft) => ({ ...draft, description: 'A better one' }))

    expect(written()).toEqual({ abc123: { ...DRAFT, description: 'A better one' } })
  })

  it('writes beside the file and renames over it, so a half-write loses nothing', async () => {
    onDisk({})

    await store.update('abc123', () => DRAFT)

    expect(io.writeFile).toHaveBeenCalledWith(`${FILE}.tmp`, expect.any(String), 'utf8')
    expect(io.rename).toHaveBeenCalledWith(`${FILE}.tmp`, FILE)
  })

  it('drops the gist entirely when its draft is emptied', async () => {
    onDisk({ abc123: DRAFT, def456: OTHER })

    await store.update('abc123', () => ({ files: {} }))
    expect(written()).toEqual({ def456: OTHER })
  })

  it('keeps a gist whose only change is its description', async () => {
    onDisk({})

    await store.update('abc123', () => ({ files: {}, description: 'A better one' }))
    expect(written()).toEqual({ abc123: { files: {}, description: 'A better one' } })
  })

  it.each([
    ['the write fails', () => io.writeFile.mockRejectedValue(new Error('EACCES'))],
    ['the rename fails', () => io.rename.mockRejectedValue(new Error('EACCES'))],
  ])('reports a draft that could not be stored when %s', async (_name, arrange) => {
    onDisk({})
    arrange()

    await expect(store.update('abc123', () => DRAFT)).resolves.toEqual({
      success: false,
      error: 'EACCES',
    })
  })

  it('takes turns, so two changes at once cannot drop each other', async () => {
    // Both start from the same file, but the second only reads once the first
    // has written — otherwise its write would carry none of the first's work.
    let stored: Record<string, unknown> = {}
    io.readFile.mockImplementation(() => Promise.resolve(JSON.stringify(stored)))
    io.writeFile.mockImplementation((_path: string, content: string) => {
      stored = JSON.parse(content) as Record<string, unknown>
      return Promise.resolve()
    })

    await Promise.all([store.update('abc123', () => DRAFT), store.update('def456', () => OTHER)])

    expect(stored).toEqual({ abc123: DRAFT, def456: OTHER })
  })

  it('keeps its turn-taking when a change itself throws', async () => {
    onDisk({})

    await expect(
      store.update('abc123', () => {
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')

    await expect(store.update('def456', () => OTHER)).resolves.toEqual({
      success: true,
      data: OTHER,
    })
  })

  it('keeps serving the ones behind a failure', async () => {
    onDisk({})
    io.writeFile.mockRejectedValueOnce(new Error('EACCES'))

    const [failed, next] = await Promise.all([
      store.update('abc123', () => DRAFT),
      store.update('def456', () => OTHER),
    ])

    expect(failed).toEqual({ success: false, error: 'EACCES' })
    expect(next).toEqual({ success: true, data: OTHER })
  })
})

describe('draftStore.clear', () => {
  it('removes one gist and leaves the rest', async () => {
    onDisk({ abc123: DRAFT, def456: OTHER })

    await expect(store.clear('abc123')).resolves.toEqual({ success: true, data: null })
    expect(written()).toEqual({ def456: OTHER })
  })

  it('reports a failed write, stringifying a non-Error', async () => {
    onDisk({ abc123: DRAFT })
    io.writeFile.mockRejectedValue('locked')

    await expect(store.clear('abc123')).resolves.toEqual({ success: false, error: 'locked' })
  })
})
