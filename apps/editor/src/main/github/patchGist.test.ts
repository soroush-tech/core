import type { GistDraft } from '../../shared/ipc'
import { API_HEADERS, GISTS_URL } from './const'
import { patchGist, toFilePatch } from './patchGist'

const response = (ok = true, status = 200) => ({ ok, status }) as Response

const DRAFT: GistDraft = {
  files: {
    'notes.md': { status: 'modified', content: 'edited' },
    'draft.md': { status: 'added', content: '# new' },
    'gone.md': { status: 'deleted' },
  },
}

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

const sentBody = () =>
  JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body)) as {
    files: unknown
    description?: string
  }

beforeEach(() => vi.clearAllMocks())

describe('toFilePatch', () => {
  it('writes content for added and modified files and nulls deleted ones', () => {
    expect(toFilePatch(DRAFT.files)).toEqual({
      'notes.md': { content: 'edited' },
      'draft.md': { content: '# new' },
      'gone.md': null,
    })
  })

  it.each([
    ['a file added but never typed into', 'added' as const],
    ['a file edited down to nothing', 'modified' as const],
  ])('publishes %s as a blank line, which GitHub accepts', (_name, status) => {
    // The empty string is a 422, so an untouched new file could never publish.
    expect(toFilePatch({ 'new.md': { status, content: '' } })).toEqual({
      'new.md': { content: '\n' },
    })
  })
})

describe('patchGist', () => {
  it('sends the whole draft as one PATCH', async () => {
    fetchMock.mockResolvedValue(response())

    await expect(patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: null,
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${GISTS_URL}/abc123`)
    expect(init.method).toBe('PATCH')
    expect(init.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
      'content-type': 'application/json',
    })
    // Only staged filenames appear, so untouched files keep their content.
    expect(sentBody().files).toEqual(toFilePatch(DRAFT.files))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('leaves the description alone when it was not edited', async () => {
    fetchMock.mockResolvedValue(response())
    await patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)

    expect(sentBody()).not.toHaveProperty('description')
  })

  it('sends an edited description alongside the files', async () => {
    fetchMock.mockResolvedValue(response())
    await patchGist(
      'abc123',
      { ...DRAFT, description: 'A better description' },
      'github_pat_123',
      fetchFn
    )

    expect(sentBody().description).toBe('A better description')
  })

  it('sends an emptied description, which clears it on GitHub', async () => {
    fetchMock.mockResolvedValue(response())
    await patchGist('abc123', { files: {}, description: '' }, 'github_pat_123', fetchFn)

    expect(sentBody().description).toBe('')
  })

  it('escapes the gist id into the path', async () => {
    fetchMock.mockResolvedValue(response())
    await patchGist('../../evil', DRAFT, 'github_pat_123', fetchFn)

    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe(`${GISTS_URL}/..%2F..%2Fevil`)
  })

  it('asks the user to reconnect when the stored token is rejected', async () => {
    fetchMock.mockResolvedValue(response(false, 401))
    await expect(patchGist('abc123', DRAFT, 'stale', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub rejected the stored token — connect the account again',
    })
  })

  it('explains what to check when GitHub rejects the changeset', async () => {
    fetchMock.mockResolvedValue(response(false, 422))

    const result = await patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)
    expect(result).toMatchObject({ success: false })
    expect(result.success ? '' : result.error).toContain('at least one file')
  })

  it('reports any other failing status', async () => {
    fetchMock.mockResolvedValue(response(false, 503))
    await expect(patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 503',
    })
  })

  it('surfaces a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'offline',
    })
  })

  it('stringifies a non-Error rejection', async () => {
    fetchMock.mockRejectedValue('socket hang up')
    await expect(patchGist('abc123', DRAFT, 'github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'socket hang up',
    })
  })
})
