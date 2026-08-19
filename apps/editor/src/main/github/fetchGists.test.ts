import { API_HEADERS, GISTS_MAX_PAGES, GISTS_PAGE_SIZE, GISTS_URL } from './const'
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

/** A page GitHub would consider full, so the fetch asks for another. */
const fullPage = (id: string) => Array.from({ length: GISTS_PAGE_SIZE }, () => rawGist({ id }))

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

/** The page number asked for on the nth request. */
const pageOf = (call: number) => (fetchMock.mock.calls[call][0] as URL).searchParams.get('page')

beforeEach(() => vi.clearAllMocks())

describe('fetchGists', () => {
  it('summarises the account gists and asks GitHub for its largest page', async () => {
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

  it('stops after one request when the first page is not full', async () => {
    fetchMock.mockResolvedValue(jsonResponse([rawGist()]))

    await fetchGists('github_pat_123', fetchFn)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(pageOf(0)).toBe('1')
  })

  it('keeps paging while GitHub returns full pages, and concatenates them', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(fullPage('page-one')))
      .mockResolvedValueOnce(jsonResponse(fullPage('page-two')))
      .mockResolvedValueOnce(jsonResponse([rawGist({ id: 'last' })]))

    const result = await fetchGists('github_pat_123', fetchFn)

    expect(result.success && result.data).toHaveLength(GISTS_PAGE_SIZE * 2 + 1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect([pageOf(0), pageOf(1), pageOf(2)]).toEqual(['1', '2', '3'])
    // Newest first, so the order pages arrived in is the order they are listed.
    expect(result.success && result.data.at(-1)?.id).toBe('last')
  })

  it('stops at an empty page rather than asking again', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(fullPage('page-one')))
      .mockResolvedValueOnce(jsonResponse([]))

    const result = await fetchGists('github_pat_123', fetchFn)

    expect(result.success && result.data).toHaveLength(GISTS_PAGE_SIZE)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives up at the page cap, so a broken response cannot page forever', async () => {
    // Every page comes back full, which would otherwise never terminate.
    fetchMock.mockResolvedValue(jsonResponse(fullPage('endless')))

    const result = await fetchGists('github_pat_123', fetchFn)

    expect(fetchMock).toHaveBeenCalledTimes(GISTS_MAX_PAGES)
    // A full last page means there are more; a list that stops there is not the
    // every-gist this promised, so it says so rather than looking complete.
    expect(result).toEqual({
      success: false,
      error: `You have more than ${String(GISTS_MAX_PAGES * GISTS_PAGE_SIZE)} gists - more than this can list`,
    })
  })

  it('abandons the whole list when a later page fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(fullPage('page-one')))
      .mockResolvedValueOnce(jsonResponse({}, false, 503))

    await expect(fetchGists('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 503',
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
      error: 'GitHub rejected the stored token - connect the account again',
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
