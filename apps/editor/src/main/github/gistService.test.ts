import type { GistDraft } from '../../shared/ipc'
import { fetchGistFiles } from './fetchGistFiles'
import { fetchGists } from './fetchGists'
import { createGistService, type GistService } from './gistService'
import { patchGist } from './patchGist'

vi.mock('./fetchGists', () => ({ fetchGists: vi.fn() }))
vi.mock('./fetchGistFiles', () => ({ fetchGistFiles: vi.fn() }))
vi.mock('./patchGist', () => ({ patchGist: vi.fn() }))

const store = { read: vi.fn(), write: vi.fn(), clear: vi.fn() }
const drafts = { read: vi.fn(), update: vi.fn(), clear: vi.fn() }
const fetchFn = vi.fn() as unknown as typeof fetch

const CREDENTIALS = { login: 'soroushm', token: 'github_pat_123', avatar: null }
const GISTS = [
  { id: 'abc123', description: null, filename: 'notes.md', fileCount: 1, isPublic: false },
]
const FILES = [{ filename: 'notes.md', content: '# notes' }]
const SIGNED_OUT = 'Connect a GitHub account to see your gists'

let service: GistService

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchGists).mockResolvedValue({ success: true, data: GISTS })
  vi.mocked(fetchGistFiles).mockResolvedValue({ success: true, data: FILES })
  vi.mocked(patchGist).mockResolvedValue({ success: true, data: null })
  store.read.mockResolvedValue(CREDENTIALS)
  drafts.read.mockResolvedValue({ files: {} })
  // Stands in for the real store: hands the change whatever is "on disk" and
  // reports back what it made of it, as one step.
  drafts.update.mockImplementation(
    async (_id: string, change: (draft: GistDraft) => GistDraft) => ({
      success: true,
      data: change((await drafts.read()) as GistDraft),
    })
  )
  drafts.clear.mockResolvedValue({ success: true, data: null })
  service = createGistService({ fetchFn, store, drafts })
})

describe('gistService.list', () => {
  it('lists the gists using the stored token', async () => {
    await expect(service.list()).resolves.toEqual({ success: true, data: GISTS })
    expect(fetchGists).toHaveBeenCalledWith('github_pat_123', fetchFn)
  })

  it('asks for an account before calling GitHub when signed out', async () => {
    store.read.mockResolvedValue(null)

    await expect(service.list()).resolves.toEqual({ success: false, error: SIGNED_OUT })
    expect(fetchGists).not.toHaveBeenCalled()
  })

  it('re-reads the store on every call, so signing out takes effect at once', async () => {
    await service.list()
    store.read.mockResolvedValue(null)

    await expect(service.list()).resolves.toMatchObject({ success: false })
    expect(store.read).toHaveBeenCalledTimes(2)
  })
})

describe('gistService.files', () => {
  it('fetches the files of one gist with the stored token', async () => {
    await expect(service.files('abc123')).resolves.toEqual({ success: true, data: FILES })
    expect(fetchGistFiles).toHaveBeenCalledWith('abc123', 'github_pat_123', fetchFn)
  })

  it('asks for an account before calling GitHub when signed out', async () => {
    store.read.mockResolvedValue(null)

    await expect(service.files('abc123')).resolves.toEqual({ success: false, error: SIGNED_OUT })
    expect(fetchGistFiles).not.toHaveBeenCalled()
  })
})

describe('gistService.draft', () => {
  it('reads the stored draft', async () => {
    const draft: GistDraft = { files: { 'notes.md': { status: 'modified', content: 'edited' } } }
    drafts.read.mockResolvedValue(draft)

    await expect(service.draft('abc123')).resolves.toEqual(draft)
  })
})

describe('gistService.stage', () => {
  beforeEach(() => drafts.read.mockResolvedValue({ files: {} }))

  it('stages a change without touching GitHub', async () => {
    await expect(
      service.stage('abc123', 'notes.md', { status: 'modified', content: 'edited' })
    ).resolves.toEqual({
      success: true,
      data: { files: { 'notes.md': { status: 'modified', content: 'edited' } } },
    })

    // Read and write as one step, so a change made at the same time is not lost.
    expect(drafts.update).toHaveBeenCalledWith('abc123', expect.any(Function))
    expect(patchGist).not.toHaveBeenCalled()
  })

  it('keeps a locally added file marked added however often it is edited', async () => {
    drafts.read.mockResolvedValue({ files: { 'draft.md': { status: 'added', content: '' } } })

    await expect(
      service.stage('abc123', 'draft.md', { status: 'modified', content: 'typed' })
    ).resolves.toEqual({
      success: true,
      data: { files: { 'draft.md': { status: 'added', content: 'typed' } } },
    })
  })

  it('clears a staged change when the entry is null', async () => {
    drafts.read.mockResolvedValue({ files: { 'notes.md': { status: 'deleted' } } })

    await expect(service.stage('abc123', 'notes.md', null)).resolves.toEqual({
      success: true,
      data: { files: {} },
    })
  })

  it('leaves a staged description alone', async () => {
    drafts.read.mockResolvedValue({ files: {}, description: 'A better one' })

    await expect(service.stage('abc123', 'notes.md', { status: 'deleted' })).resolves.toMatchObject(
      {
        data: { description: 'A better one' },
      }
    )
  })

  it('reports a draft that cannot be persisted', async () => {
    drafts.update.mockResolvedValue({ success: false, error: 'EACCES' })

    await expect(service.stage('abc123', 'notes.md', { status: 'deleted' })).resolves.toEqual({
      success: false,
      error: 'EACCES',
    })
  })
})

describe('gistService.stageDescription', () => {
  beforeEach(() => drafts.read.mockResolvedValue({ files: {} }))

  it('stages a description without touching GitHub', async () => {
    await expect(service.stageDescription('abc123', 'A better one')).resolves.toEqual({
      success: true,
      data: { files: {}, description: 'A better one' },
    })
    expect(patchGist).not.toHaveBeenCalled()
  })

  it('keeps staged files alongside it', async () => {
    drafts.read.mockResolvedValue({ files: { 'notes.md': { status: 'deleted' } } })

    await expect(service.stageDescription('abc123', 'A better one')).resolves.toMatchObject({
      data: { files: { 'notes.md': { status: 'deleted' } }, description: 'A better one' },
    })
  })

  it('stages an emptied description, which clears it on GitHub', async () => {
    await expect(service.stageDescription('abc123', '')).resolves.toEqual({
      success: true,
      data: { files: {}, description: '' },
    })
  })

  it('drops the staged description entirely when cleared with null', async () => {
    drafts.read.mockResolvedValue({ files: {}, description: 'A better one' })

    const result = await service.stageDescription('abc123', null)
    expect(result).toEqual({ success: true, data: { files: {} } })
    expect(result.success && 'description' in result.data).toBe(false)
  })

  it('reports a draft that cannot be persisted', async () => {
    drafts.update.mockResolvedValue({ success: false, error: 'EACCES' })

    await expect(service.stageDescription('abc123', 'A better one')).resolves.toEqual({
      success: false,
      error: 'EACCES',
    })
  })
})

describe('gistService.reset', () => {
  it('throws the draft away', async () => {
    await expect(service.reset('abc123')).resolves.toEqual({ success: true, data: null })
    expect(drafts.clear).toHaveBeenCalledWith('abc123')
    expect(patchGist).not.toHaveBeenCalled()
  })
})

describe('gistService.publish', () => {
  const DRAFT: GistDraft = {
    files: {
      'notes.md': { status: 'modified', content: 'edited' },
      'gone.md': { status: 'deleted' },
    },
  }

  it('sends the whole draft in one request, then clears it', async () => {
    drafts.read.mockResolvedValue(DRAFT)

    await expect(service.publish('abc123')).resolves.toEqual({ success: true, data: null })
    expect(patchGist).toHaveBeenCalledWith('abc123', DRAFT, 'github_pat_123', fetchFn)
    expect(drafts.clear).toHaveBeenCalledWith('abc123')
  })

  it('publishes a description-only draft', async () => {
    drafts.read.mockResolvedValue({ files: {}, description: 'A better one' })

    await expect(service.publish('abc123')).resolves.toEqual({ success: true, data: null })
    expect(patchGist).toHaveBeenCalled()
  })

  it('keeps the draft when GitHub refuses it', async () => {
    drafts.read.mockResolvedValue(DRAFT)
    vi.mocked(patchGist).mockResolvedValue({ success: false, error: 'GitHub responded 422' })

    await expect(service.publish('abc123')).resolves.toEqual({
      success: false,
      error: 'GitHub responded 422',
    })
    expect(drafts.clear).not.toHaveBeenCalled()
  })

  it('refuses an empty draft rather than sending a no-op request', async () => {
    drafts.read.mockResolvedValue({ files: {} })

    await expect(service.publish('abc123')).resolves.toEqual({
      success: false,
      error: 'Nothing to publish',
    })
    expect(patchGist).not.toHaveBeenCalled()
  })

  it('asks for an account before calling GitHub when signed out', async () => {
    store.read.mockResolvedValue(null)

    await expect(service.publish('abc123')).resolves.toEqual({ success: false, error: SIGNED_OUT })
    expect(patchGist).not.toHaveBeenCalled()
  })
})
