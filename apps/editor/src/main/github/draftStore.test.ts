import type { GistDraft } from '../../shared/ipc'
import { createDraftStore, isEmptyDraft, type DraftStore } from './draftStore'

const FILE = 'C:\\userData\\gist-drafts.json'
const DRAFT: GistDraft = { files: { 'notes.md': { status: 'modified', content: 'edited' } } }
const OTHER: GistDraft = { files: { 'other.md': { status: 'deleted' } } }

const io = { readFile: vi.fn(), writeFile: vi.fn() }

let store: DraftStore

/** The JSON the store would have found on disk. */
const onDisk = (drafts: Record<string, unknown>) =>
  io.readFile.mockResolvedValue(JSON.stringify(drafts))

/** What the store just wrote back. */
const written = () => JSON.parse(String(io.writeFile.mock.calls[0][1])) as Record<string, unknown>

beforeEach(() => {
  vi.clearAllMocks()
  io.writeFile.mockResolvedValue(undefined)
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

describe('draftStore.write', () => {
  it('stores the draft alongside other gists', async () => {
    onDisk({ def456: OTHER })

    await expect(store.write('abc123', DRAFT)).resolves.toEqual({ success: true, data: null })
    expect(written()).toEqual({ def456: OTHER, abc123: DRAFT })
    expect(io.writeFile).toHaveBeenCalledWith(FILE, expect.any(String), 'utf8')
  })

  it('drops the gist entirely when its draft is emptied', async () => {
    onDisk({ abc123: DRAFT, def456: OTHER })

    await store.write('abc123', { files: {} })
    expect(written()).toEqual({ def456: OTHER })
  })

  it('keeps a gist whose only change is its description', async () => {
    onDisk({})

    await store.write('abc123', { files: {}, description: 'A better one' })
    expect(written()).toEqual({ abc123: { files: {}, description: 'A better one' } })
  })

  it('reports a failed write', async () => {
    onDisk({})
    io.writeFile.mockRejectedValue(new Error('EACCES'))

    await expect(store.write('abc123', DRAFT)).resolves.toEqual({
      success: false,
      error: 'EACCES',
    })
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
