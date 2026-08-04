import { API_HEADERS, GISTS_PAGE_SIZE, GISTS_URL } from './const'
import { fetchGists } from './fetchGists'

const jsonResponse = (payload: unknown, ok = true, status = 200) =>
  ({ ok, status, json: () => Promise.resolve(payload) }) as Response

const rawGist = (overrides: Record<string, unknown> = {}) => ({
  id: 'abc123',
  description: 'A useful snippet',
  files: { 'notes.md': {}, 'extra.md': {} },
  public: true,
  ...overrides,
})

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

beforeEach(() => vi.clearAllMocks())

describe('fetchGists', () => {
  it('summarises the account gists and asks for a single page', async () => {
    fetchMock.mockResolvedValue(jsonResponse([rawGist()]))

    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A useful snippet',
          filename: 'notes.md',
          fileCount: 2,
          isPublic: true,
        },
      ],
    })

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.origin + url.pathname).toBe(GISTS_URL)
    expect(url.searchParams.get('per_page')).toBe(String(GISTS_PAGE_SIZE))
    expect(init.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
    })
  })

  it.each([
    ['null', null],
    ['blank', '   '],
  ])('reports a %s description as absent', async (_name, description) => {
    fetchMock.mockResolvedValue(jsonResponse([rawGist({ description })]))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toMatchObject({
      data: [{ description: null }],
    })
  })

  it('titles a gist with no files as untitled', async () => {
    fetchMock.mockResolvedValue(jsonResponse([rawGist({ files: {} })]))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toMatchObject({
      data: [{ filename: 'untitled', fileCount: 0 }],
    })
  })

  it('carries a secret gist through as non-public', async () => {
    fetchMock.mockResolvedValue(jsonResponse([rawGist({ public: false })]))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toMatchObject({
      data: [{ isPublic: false }],
    })
  })

  it('returns an empty list for an account with no gists', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: [],
    })
  })

  it('asks the user to reconnect when the stored token is rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 401))
    await expect(fetchGists('stale', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub rejected the stored token — connect the account again',
    })
  })

  it('reports any other failing status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 503))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 503',
    })
  })

  it('rejects a response that is not a list', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'nope' }))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'Unexpected gist response from GitHub',
    })
  })

  it('surfaces a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'offline',
    })
  })

  it('stringifies a non-Error rejection', async () => {
    fetchMock.mockRejectedValue('socket hang up')
    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'socket hang up',
    })
  })
})
