import type { GistDraft } from '../../shared/ipc'
import { API_HEADERS, GISTS_URL } from './const'
import { createGist } from './createGist'

const jsonResponse = (payload: unknown, ok = true, status = 200) =>
  ({ ok, status, json: () => Promise.resolve(payload) }) as Response

const DRAFT: GistDraft = {
  files: { 'notes.md': { status: 'added', content: '# notes' } },
  description: 'A new gist',
}

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

const sentBody = () =>
  JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body)) as {
    description: string
    public: boolean
    files: Record<string, { content: string }>
  }

beforeEach(() => vi.clearAllMocks())

describe('createGist', () => {
  it('posts the draft and returns the new gist id', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: 'abc123',
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(GISTS_URL)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
      'content-type': 'application/json',
    })
    expect(sentBody()).toEqual({
      description: 'A new gist',
      public: false,
      files: { 'notes.md': { content: '# notes' } },
    })
  })

  it('creates a secret gist unless a public one was asked for', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await createGist(DRAFT, false, 'github_pat_123', fetchFn)
    expect(sentBody().public).toBe(false)
  })

  it('creates a public gist when asked', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await createGist(DRAFT, true, 'github_pat_123', fetchFn)
    expect(sentBody().public).toBe(true)
  })

  it('sends an empty description when the draft has none', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await createGist({ files: DRAFT.files }, false, 'github_pat_123', fetchFn)
    expect(sentBody().description).toBe('')
  })

  it('publishes an empty file as a blank line, which GitHub accepts', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await createGist(
      { files: { 'new.md': { status: 'added', content: '' } } },
      false,
      'github_pat_123',
      fetchFn
    )
    expect(sentBody().files).toEqual({ 'new.md': { content: '\n' } })
  })

  it('drops staged deletions - there is nothing published to delete yet', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))

    await createGist(
      { files: { ...DRAFT.files, 'gone.md': { status: 'deleted' } } },
      false,
      'github_pat_123',
      fetchFn
    )
    expect(sentBody().files).toEqual({ 'notes.md': { content: '# notes' } })
  })

  it('refuses a gist with no files rather than letting GitHub reject it', async () => {
    await expect(
      createGist({ files: {}, description: 'Nothing here' }, false, 'github_pat_123', fetchFn)
    ).resolves.toEqual({
      success: false,
      error: 'Add a file before creating the gist',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('asks the user to reconnect when the stored token is rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 401))
    await expect(createGist(DRAFT, false, 'stale', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub rejected the stored token - connect the account again',
    })
  })

  it('reports a filename GitHub would not take', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 422))
    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub would not accept one of these filenames',
    })
  })

  it('reports any other failing status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 503))
    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 503',
    })
  })

  it('rejects a response without an id', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'Unexpected gist response from GitHub',
    })
  })

  it('surfaces a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'offline',
    })
  })

  it('stringifies a non-Error rejection', async () => {
    fetchMock.mockRejectedValue('socket hang up')
    await expect(createGist(DRAFT, false, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'socket hang up',
    })
  })
})
