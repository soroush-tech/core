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
      data: { description: null, files: [{ filename: 'notes.md', content: '# notes' }] },
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${GISTS_URL}/abc123`)
    expect(init.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
    })
  })

  it.each([
    ['a path of its own', '../../evil'],
    ['a query string', 'abc123?x=1'],
    ['nothing at all', ''],
  ])('refuses an id carrying %s, without asking GitHub', async (_name, id) => {
    await expect(fetchGistFiles(id, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'That is not a gist id',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('carries the description, so a gist opened by id knows its own', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ description: 'A snippet', files: { 'notes.md': rawFile() } })
    )

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toMatchObject({
      data: { description: 'A snippet' },
    })
  })

  it.each([
    ['an empty description', ''],
    ['a blank one', '   '],
    ['a missing one', undefined],
  ])('reports %s as absent', async (_name, description) => {
    fetchMock.mockResolvedValue(jsonResponse({ description, files: { 'notes.md': rawFile() } }))

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toMatchObject({
      data: { description: null },
    })
  })

  it('fetches the whole file when GitHub truncated the inline content', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ files: { 'big.md': rawFile({ truncated: true, content: '# par' }) } })
      )
      .mockResolvedValueOnce(textResponse('# partial no more'))

    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: { description: null, files: [{ filename: 'notes.md', content: '# partial no more' }] },
    })
    // Checked against GitHub's own host and pinned there: following a redirect
    // is the one way it could leave GitHub.
    const [url, init] = fetchMock.mock.calls[1] as [URL, RequestInit]
    expect(String(url)).toBe('https://gist.githubusercontent.com/raw/notes.md')
    expect(init.redirect).toBe('error')
  })

  it('keeps only the path of the raw_url, dropping anything else it carried', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          files: {
            'big.md': rawFile({
              truncated: true,
              content: '# par',
              raw_url:
                'https://gist.githubusercontent.com/raw/notes.md?redirect=evil.example.com#x',
            }),
          },
        })
      )
      .mockResolvedValueOnce(textResponse('# partial no more'))

    await fetchGistFiles('abc123', 'github_pat_123', fetchFn)

    expect(String(fetchMock.mock.calls[1][0])).toBe(
      'https://gist.githubusercontent.com/raw/notes.md'
    )
  })

  it('fails rather than handing back the partial content', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ files: { 'big.md': rawFile({ truncated: true, content: '# par' }) } })
      )
      .mockResolvedValueOnce(textResponse('', false))

    // Editing and publishing a file that only looked whole would cut the gist
    // down to what was shown.
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'Could not read all of notes.md - GitHub responded 500',
    })
  })

  it.each([
    ['somewhere that is not GitHub', 'https://evil.example.com/raw/notes.md'],
    ['plain http', 'http://gist.githubusercontent.com/raw/notes.md'],
    ['something that is not a URL at all', 'not a url'],
    [
      'GitHub with a host smuggled into the credentials',
      'https://gist.githubusercontent.com@evil.example.com/raw/notes.md',
    ],
  ])('will not follow a raw_url pointing at %s', async (_name, raw_url) => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ files: { 'big.md': rawFile({ truncated: true, content: '# par', raw_url }) } })
    )

    // No request goes where it says, and the partial content is not passed off
    // as the whole file either.
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub gave no usable address for the rest of notes.md',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns an empty list for a gist with no files', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: {} }))
    await expect(fetchGistFiles('abc123', 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: { description: null, files: [] },
    })
  })

  it('asks the user to reconnect when the stored token is rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 401))
    await expect(fetchGistFiles('abc123', 'stale', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub rejected the stored token - connect the account again',
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
