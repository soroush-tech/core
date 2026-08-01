import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@soroush.tech/design-system/Sidebar'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { GitHubAuth } from './GitHubAuth'

const AVATAR = 'data:image/png;base64,AQID'

const githubApi = {
  status: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  openTokenSettings: vi.fn(),
}

vi.stubGlobal('editorAPI', { github: githubApi })

/** The rail supplies the panel column GitHubAuth ports into. */
const renderAuth = () =>
  render(
    <ThemeProvider theme={editorTheme}>
      <Sidebar aria-label="Editor panels" isOpen={false} hasPanel>
        <GitHubAuth />
      </Sidebar>
    </ThemeProvider>
  )

const railButton = (name: RegExp | string) => screen.getByRole('button', { name })
const tokenField = () => screen.getByLabelText('GitHub personal access token')

beforeEach(() => {
  vi.clearAllMocks()
  githubApi.status.mockResolvedValue({ success: true, data: { login: null, avatar: null } })
  githubApi.signIn.mockResolvedValue({
    success: true,
    data: { login: 'soroushm', avatar: AVATAR },
  })
  githubApi.signOut.mockResolvedValue({ success: true, data: null })
  githubApi.openTokenSettings.mockResolvedValue({ success: true, data: null })
})

describe('GitHubAuth', () => {
  it('sits in the rail as a collapsed disclosure while signed out', async () => {
    renderAuth()
    const trigger = await screen.findByRole('button', { name: 'GitHub — not signed in' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('GitHub personal access token')).not.toBeInTheDocument()
  })

  it('opens the panel with the token form when selected', async () => {
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))

    expect(railButton(/GitHub/)).toHaveAttribute('aria-expanded', 'true')
    // The form is ported into the rail's panel, not rendered in the row.
    expect(screen.getByRole('region', { name: 'GitHub' })).toContainElement(tokenField())
  })

  it('masks the token as it is typed', async () => {
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))
    await userEvent.type(tokenField(), 'github_pat_123')

    expect(tokenField()).toHaveAttribute('type', 'password')
  })

  it('connects the account and shows its avatar in the rail', async () => {
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))
    await userEvent.type(tokenField(), 'github_pat_123')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(githubApi.signIn).toHaveBeenCalledWith('github_pat_123')
    expect(
      await screen.findByRole('button', { name: 'GitHub — signed in as @soroushm' })
    ).toBeInTheDocument()
    expect(screen.getByAltText('@soroushm')).toHaveAttribute('src', AVATAR)
    expect(screen.getByText('Connected as @soroushm')).toBeInTheDocument()
  })

  it('falls back to an initial when the avatar is missing', async () => {
    githubApi.status.mockResolvedValue({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
    renderAuth()

    expect(await screen.findByText('S')).toBeInTheDocument()
  })

  it('keeps a rejected token in the field for correction', async () => {
    githubApi.signIn.mockResolvedValue({ success: false, error: 'GitHub rejected that token' })
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))
    await userEvent.type(tokenField(), 'typo')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('GitHub rejected that token')
    expect(tokenField()).toHaveValue('typo')
  })

  it('opens GitHub to create a token', async () => {
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))
    await userEvent.click(screen.getByRole('button', { name: 'Get a token' }))

    expect(githubApi.openTokenSettings).toHaveBeenCalled()
  })

  it('signs out back to the token form', async () => {
    githubApi.status.mockResolvedValue({
      success: true,
      data: { login: 'soroushm', avatar: AVATAR },
    })
    renderAuth()
    await userEvent.click(await screen.findByRole('button', { name: /signed in as @soroushm/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(await screen.findByLabelText('GitHub personal access token')).toBeInTheDocument()
  })

  it('closes the panel when the row is selected again', async () => {
    renderAuth()
    await userEvent.click(railButton('GitHub — not signed in'))
    expect(tokenField()).toBeInTheDocument()

    await userEvent.click(railButton(/GitHub/))
    expect(screen.queryByLabelText('GitHub personal access token')).not.toBeInTheDocument()
  })
})
