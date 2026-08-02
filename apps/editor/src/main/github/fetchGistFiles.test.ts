import { API_HEADERS, GISTS_URL } from './const'
import { fetchGistFiles } from './fetchGistFiles'

const jsonResponse = (payload: unknown, ok = true, status = 200) =>
  ({ ok, status, json: () => Promise.resolve(payload) }) as Response

const textResponse = (body: string, ok = true) =>
  ({ ok, status: ok ? 200 : 500, text: () => Promise.resolve(body) }) as Response

const rawFile = (overrides: Record<string, unknown> = {}) => ({
  filename: 'notes.md',
  content: '# notes',
  truncated: false,
  raw_url: 'https://gist.githubusercontent.com/raw/notes.md',
  ...overrides,
})

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

beforeEach(() => vi.clearAllMocks())

describe('fetchGistFiles', () => {
  it('returns each file with its content', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: { 'notes.md': rawFile() } }))

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: [{ filename: 'notes.md', content: '# notes' }],
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${GISTS_URL}/abc123`)
    expect(init.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
    })
  })

  it('escapes the gist id into the path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: {} }))
    await fetchGistFiles('../../evil', 'github_pat_123', fetchFn)

    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe(`${GISTS_URL}/..%2F..%2Fevil`)
  })

  it('fetches the whole file when GitHub truncated the inline content', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ files: { 'big.md': rawFile({ truncated: true, content: '# par' }) } })
      )
      .mockResolvedValueOnce(textResponse('# partial no more'))

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: [{ filename: 'notes.md', content: '# partial no more' }],
    })
    expect(fetchMock.mock.calls[1][0]).toBe('https://gist.githubusercontent.com/raw/notes.md')
  })

  it('keeps the partial content when the raw fetch fails', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ files: { 'big.md': rawFile({ truncated: true, content: '# par' }) } })
      )
      .mockResolvedValueOnce(textResponse('', false))

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toMatchObject({
      data: [{ content: '# par' }],
    })
  })

  it('returns an empty list for a gist with no files', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: {} }))
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: [],
    })
  })

  it('asks the user to reconnect when the stored token is rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 401))
    await expect(fetchGistFiles('abc123', 'stale', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub rejected the stored token — connect the account again',
    })
  })

  it('reports a gist that is gone', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 404))
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 404',
    })
  })

  it('rejects a response without files', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'abc123' }))
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'Unexpected gist response from GitHub',
    })
  })

  it('surfaces a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'offline',
    })
  })

  it('stringifies a non-Error rejection', async () => {
    fetchMock.mockRejectedValue('socket hang up')
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'socket hang up',
    })
  })
})
