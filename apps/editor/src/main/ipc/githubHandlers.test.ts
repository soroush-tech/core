import { GITHUB_CHANNELS } from '../../shared/ipc'
import { TOKEN_SETTINGS_URL } from '../github/const'

const { handlers, openExternal } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
  openExternal: vi.fn(),
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(channel, handler)
    },
  },
  shell: { openExternal },
}))

const { registerGitHubHandlers } = await import('./githubHandlers')

const service = {
  getStatus: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}
registerGitHubHandlers(service)

const invoke = (channel: string, ...args: unknown[]) => handlers.get(channel)!({}, ...args)

beforeEach(() => {
  vi.clearAllMocks()
  openExternal.mockResolvedValue(undefined)
})

describe('registerGitHubHandlers', () => {
  it('wraps the account status in a Result', async () => {
    service.getStatus.mockResolvedValue({ login: 'soroushm', avatar: null })
    await expect(invoke(GITHUB_CHANNELS.status)).resolves.toEqual({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
  })

  it.each([
    ['a non-string token', 42],
    ['a blank token', '   '],
    ['no token at all', undefined],
  ])('rejects %s without calling GitHub', async (_name, token) => {
    await expect(invoke(GITHUB_CHANNELS.signIn, token)).resolves.toEqual({
      success: false,
      error: 'Enter a personal access token',
    })
    expect(service.signIn).not.toHaveBeenCalled()
  })

  it('trims the pasted token before using it', async () => {
    service.signIn.mockResolvedValue({ success: true, data: { login: 'soroushm', avatar: null } })

    await expect(invoke(GITHUB_CHANNELS.signIn, '  github_pat_123\n')).resolves.toEqual({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
    expect(service.signIn).toHaveBeenCalledWith('github_pat_123')
  })

  it('delegates sign-out to the service', async () => {
    service.signOut.mockResolvedValue({ success: true, data: null })
    await expect(invoke(GITHUB_CHANNELS.signOut)).resolves.toEqual({ success: true, data: null })
  })

  it('opens the constant token URL, never a renderer-supplied one', async () => {
    await expect(
      invoke(GITHUB_CHANNELS.openTokenSettings, 'https://evil.example/steal')
    ).resolves.toEqual({ success: true, data: null })
    expect(openExternal).toHaveBeenCalledWith(TOKEN_SETTINGS_URL)
    expect(openExternal).toHaveBeenCalledTimes(1)
  })

  it('reports a browser that would not open', async () => {
    openExternal.mockRejectedValue(new Error('no handler for https'))
    await expect(invoke(GITHUB_CHANNELS.openTokenSettings)).resolves.toEqual({
      success: false,
      error: 'no handler for https',
    })
  })

  it('stringifies a non-Error browser failure', async () => {
    openExternal.mockRejectedValue('blocked')
    await expect(invoke(GITHUB_CHANNELS.openTokenSettings)).resolves.toEqual({
      success: false,
      error: 'blocked',
    })
  })
})
