import { act, renderHook, waitFor } from '@testing-library/react'
import { useGitHubAuth } from './useGitHubAuth'

const githubApi = {
  status: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  openTokenSettings: vi.fn(),
}

vi.stubGlobal('editorAPI', { github: githubApi })

beforeEach(() => {
  vi.clearAllMocks()
  githubApi.status.mockResolvedValue({ success: true, data: { login: null, avatar: null } })
  githubApi.signIn.mockResolvedValue({ success: true, data: { login: 'soroushm', avatar: null } })
  githubApi.signOut.mockResolvedValue({ success: true, data: null })
  githubApi.openTokenSettings.mockResolvedValue({ success: true, data: null })
})

describe('useGitHubAuth', () => {
  it('adopts the account already connected at startup', async () => {
    githubApi.status.mockResolvedValue({ success: true, data: { login: 'soroushm', avatar: null } })
    const { result } = renderHook(() => useGitHubAuth())
    await waitFor(() => expect(result.current.login).toBe('soroushm'))
  })

  it('stays signed out when the status call fails', async () => {
    githubApi.status.mockResolvedValue({ success: false, error: 'no window' })
    const { result } = renderHook(() => useGitHubAuth())
    await waitFor(() => expect(githubApi.status).toHaveBeenCalled())
    expect(result.current.login).toBeNull()
  })

  it('connects the account a valid token belongs to', async () => {
    const { result } = renderHook(() => useGitHubAuth())

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.signIn('github_pat_123')
    })

    expect(accepted).toBe(true)
    expect(githubApi.signIn).toHaveBeenCalledWith('github_pat_123')
    expect(result.current.login).toBe('soroushm')
    expect(result.current.isSaving).toBe(false)
  })

  it('reports a rejected token and stays signed out', async () => {
    githubApi.signIn.mockResolvedValue({ success: false, error: 'GitHub rejected that token' })
    const { result } = renderHook(() => useGitHubAuth())

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.signIn('typo')
    })

    expect(accepted).toBe(false)
    expect(result.current.login).toBeNull()
    expect(result.current.error).toBe('GitHub rejected that token')
  })

  it('flags the in-flight check', async () => {
    githubApi.signIn.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useGitHubAuth())

    act(() => void result.current.signIn('github_pat_123'))
    await waitFor(() => expect(result.current.isSaving).toBe(true))
  })

  it('clears the account on sign-out', async () => {
    githubApi.status.mockResolvedValue({ success: true, data: { login: 'soroushm', avatar: null } })
    const { result } = renderHook(() => useGitHubAuth())
    await waitFor(() => expect(result.current.login).toBe('soroushm'))

    await act(async () => result.current.signOut())
    expect(result.current.login).toBeNull()
  })

  it('keeps the account and reports the error when sign-out fails', async () => {
    githubApi.status.mockResolvedValue({ success: true, data: { login: 'soroushm', avatar: null } })
    githubApi.signOut.mockResolvedValue({ success: false, error: 'file locked' })
    const { result } = renderHook(() => useGitHubAuth())
    await waitFor(() => expect(result.current.login).toBe('soroushm'))

    await act(async () => result.current.signOut())
    expect(result.current.login).toBe('soroushm')
    expect(result.current.error).toBe('file locked')
  })

  it('opens the token page without passing a URL', async () => {
    const { result } = renderHook(() => useGitHubAuth())
    await act(async () => result.current.openTokenSettings())
    expect(githubApi.openTokenSettings).toHaveBeenCalledWith()
  })

  it('reports a browser that would not open', async () => {
    githubApi.openTokenSettings.mockResolvedValue({ success: false, error: 'no handler' })
    const { result } = renderHook(() => useGitHubAuth())

    await act(async () => result.current.openTokenSettings())
    expect(result.current.error).toBe('no handler')
  })
})
