import { API_HEADERS, USER_URL } from './const'
import { fetchAccount } from './fetchAccount'

const jsonResponse = (payload: unknown, ok = true, status = 200) =>
  ({ ok, status, json: () => Promise.resolve(payload) }) as Response

const imageResponse = (ok = true) =>
  ({
    ok,
    status: ok ? 200 : 404,
    headers: new Headers({ 'content-type': 'image/jpeg' }),
    arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3]).buffer),
  }) as unknown as Response

const USER = { login: 'soroushm', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' }

const fetchMock = vi.fn()
const fetchFn = fetchMock as unknown as typeof fetch

beforeEach(() => vi.clearAllMocks())

describe('fetchAccount', () => {
  it('returns the account with the avatar inlined as a data URI', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(USER)).mockResolvedValueOnce(imageResponse())

    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: { login: 'soroushm', avatar: 'data:image/jpeg;base64,AQID' },
    })

    const [userUrl, userInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(userUrl).toBe(USER_URL)
    expect(userInit.headers).toMatchObject({
      ...API_HEADERS,
      authorization: 'Bearer github_pat_123',
    })

    // The avatar is requested small, so the stored data URI stays modest.
    const [avatarUrl] = fetchMock.mock.calls[1] as [URL]
    expect(avatarUrl.searchParams.get('s')).toBe('64')
  })

  it.each([
    ['the avatar request fails', () => fetchMock.mockResolvedValueOnce(imageResponse(false))],
    ['the avatar errors', () => fetchMock.mockRejectedValueOnce(new Error('offline'))],
  ])('keeps the account when %s', async (_name, arrangeAvatar) => {
    fetchMock.mockResolvedValueOnce(jsonResponse(USER))
    arrangeAvatar()

    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
  })

  it('keeps the account when GitHub sends no avatar URL', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ login: 'soroushm' }))

    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('defaults the media type when the avatar response omits one', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(USER)).mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3]).buffer),
    } as unknown as Response)

    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toMatchObject({
      data: { avatar: 'data:image/png;base64,AQID' },
    })
  })

  it('explains what to check when GitHub rejects the token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 401))

    const result = await fetchAccount('typo', fetchFn)
    expect(result).toMatchObject({ success: false })
    expect(result.success ? '' : result.error).toContain('Gists: Read and write')
  })

  it('reports any other failing status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 503))
    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'GitHub responded 503',
    })
  })

  it('rejects a response without a login', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'Unexpected account response from GitHub',
    })
  })

  it('surfaces a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'offline',
    })
  })

  it('stringifies a non-Error rejection', async () => {
    fetchMock.mockRejectedValue('socket hang up')
    await expect(fetchAccount('github_pat_123', fetchFn)).resolves.toEqual({
      success: false,
      error: 'socket hang up',
    })
  })
})
