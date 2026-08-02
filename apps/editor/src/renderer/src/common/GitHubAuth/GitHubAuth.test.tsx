import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { GitHubAuth, type GitHubAuthProps } from './GitHubAuth'

const signIn = vi.fn()
const signOut = vi.fn()
const openTokenSettings = vi.fn()

const renderPanel = (overrides: Partial<GitHubAuthProps> = {}) =>
  render(
    <ThemeProvider theme={editorTheme}>
      <GitHubAuth
        login={null}
        avatar={null}
        error={null}
        isSaving={false}
        signIn={signIn}
        signOut={signOut}
        openTokenSettings={openTokenSettings}
        {...overrides}
      />
    </ThemeProvider>
  )

const tokenField = () => screen.getByLabelText('GitHub personal access token')

beforeEach(() => {
  vi.clearAllMocks()
  signIn.mockResolvedValue(true)
})

describe('GitHubAuth', () => {
  it('asks for a token while signed out', () => {
    renderPanel()

    expect(tokenField()).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Connect' })).toBeDisabled()
  })

  it('submits the typed token and clears the field when accepted', async () => {
    renderPanel()
    await userEvent.type(tokenField(), 'github_pat_123')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(signIn).toHaveBeenCalledWith('github_pat_123')
    expect(tokenField()).toHaveValue('')
  })

  it('keeps a rejected token in the field for correction', async () => {
    signIn.mockResolvedValue(false)
    renderPanel()
    await userEvent.type(tokenField(), 'typo')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(tokenField()).toHaveValue('typo')
  })

  it('holds the Connect button while a token is being checked', async () => {
    renderPanel({ isSaving: true })
    await userEvent.type(tokenField(), 'github_pat_123')

    expect(screen.getByRole('button', { name: 'Connect' })).toBeDisabled()
  })

  it('opens GitHub to create a token', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get a token' }))

    expect(openTokenSettings).toHaveBeenCalled()
  })

  it('shows the connected account and signs out', async () => {
    renderPanel({ login: 'soroushm' })

    expect(screen.getByText('Connected as @soroushm')).toBeInTheDocument()
    expect(screen.queryByLabelText('GitHub personal access token')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalled()
  })

  it('announces an error', () => {
    renderPanel({ error: 'GitHub rejected that token' })

    expect(screen.getByRole('alert')).toHaveTextContent('GitHub rejected that token')
  })
})
