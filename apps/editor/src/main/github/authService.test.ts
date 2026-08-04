import { createAuthService, type AuthService } from './authService'
import { fetchAccount } from './fetchAccount'

vi.mock('./fetchAccount', () => ({ fetchAccount: vi.fn() }))

const store = {
  read: vi.fn(),
  write: vi.fn(),
  clear: vi.fn(),
}
const fetchFn = vi.fn() as unknown as typeof fetch

const ACCOUNT = { login: 'soroushm', avatar: 'data:image/png;base64,AQID' }

let service: AuthService

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchAccount).mockResolvedValue({ success: true, data: ACCOUNT })
  store.write.mockResolvedValue({ success: true, data: null })
  store.clear.mockResolvedValue({ success: true, data: null })
  service = createAuthService({ fetchFn, store })
})

describe('getStatus', () => {
  it('reports the stored account and avatar', async () => {
    store.read.mockResolvedValue({ ...ACCOUNT, token: 'github_pat_123' })
    await expect(service.getStatus()).resolves.toEqual(ACCOUNT)
  })

  it('reports signed out when nothing is stored', async () => {
    store.read.mockResolvedValue(null)
    await expect(service.getStatus()).resolves.toEqual({ login: null, avatar: null })
  })
})

describe('signIn', () => {
  it('stores a token GitHub accepts and reports the account', async () => {
    await expect(service.signIn('github_pat_123')).resolves.toEqual({
      success: true,
      data: ACCOUNT,
    })
    expect(store.write).toHaveBeenCalledWith({ ...ACCOUNT, token: 'github_pat_123' })
  })

  it('never stores a token GitHub rejects', async () => {
    vi.mocked(fetchAccount).mockResolvedValue({
      success: false,
      error: 'GitHub rejected that token',
    })

    await expect(service.signIn('typo')).resolves.toEqual({
      success: false,
      error: 'GitHub rejected that token',
    })
    expect(store.write).not.toHaveBeenCalled()
  })

  it('reports a token that cannot be stored securely', async () => {
    store.write.mockResolvedValue({ success: false, error: 'no secure storage' })

    await expect(service.signIn('github_pat_123')).resolves.toEqual({
      success: false,
      error: 'no secure storage',
    })
  })
})

describe('signOut', () => {
  it('clears the stored credentials', async () => {
    await expect(service.signOut()).resolves.toEqual({ success: true, data: null })
    expect(store.clear).toHaveBeenCalled()
  })
})
