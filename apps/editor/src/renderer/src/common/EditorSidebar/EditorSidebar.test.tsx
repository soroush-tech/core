import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { EditorSidebar } from './EditorSidebar'

const AVATAR = 'data:image/png;base64,AQID'

const githubApi = {
  status: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  openTokenSettings: vi.fn(),
}
const gistsApi = {
  list: vi.fn(),
  files: vi.fn(),
  draft: vi.fn(),
  stage: vi.fn(),
  stageDescription: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
  onDraftChanged: vi.fn(() => vi.fn()),
}

vi.stubGlobal('editorAPI', { github: githubApi, gists: gistsApi })

const onOpenFile = vi.fn()

const renderSidebar = () =>
  render(
    <ThemeProvider theme={editorTheme}>
      <EditorSidebar onOpenFile={onOpenFile} />
    </ThemeProvider>
  )

const row = (name: string) => screen.getByRole('button', { name })

beforeEach(() => {
  vi.clearAllMocks()
  githubApi.status.mockResolvedValue({ success: true, data: { login: null, avatar: null } })
  githubApi.signIn.mockResolvedValue({
    success: true,
    data: { login: 'soroushm', avatar: AVATAR },
  })
  githubApi.signOut.mockResolvedValue({ success: true, data: null })
  githubApi.openTokenSettings.mockResolvedValue({ success: true, data: null })
  gistsApi.list.mockResolvedValue({
    success: true,
    data: [
      {
        id: 'abc123',
        description: 'A snippet',
        filename: 'notes.md',
        fileCount: 2,
        isPublic: false,
      },
    ],
  })
  gistsApi.files.mockResolvedValue({
    success: true,
    data: [{ filename: 'notes.md', content: '# notes' }],
  })
  gistsApi.draft.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.stage.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.stageDescription.mockResolvedValue({ success: true, data: { files: {} } })
})

describe('EditorSidebar', () => {
  it('starts with every row collapsed and nothing fetched', async () => {
    renderSidebar()

    for (const name of ['Files', 'Gists', 'GitHub']) {
      expect(await screen.findByRole('button', { name })).toHaveAttribute('aria-expanded', 'false')
    }
    expect(gistsApi.list).not.toHaveBeenCalled()
    expect(gistsApi.files).not.toHaveBeenCalled()
  })

  it('asks for a gist before showing any files', async () => {
    renderSidebar()
    await userEvent.click(row('Files'))

    expect(await screen.findByText('Select a gist to see its files.')).toBeInTheDocument()
    expect(gistsApi.files).not.toHaveBeenCalled()
  })

  it('follows a picked gist into the files panel', async () => {
    renderSidebar()
    await userEvent.click(row('Gists'))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))

    expect(row('Files')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Gists')).toHaveAttribute('aria-expanded', 'false')
    expect(gistsApi.files).toHaveBeenCalledWith('abc123')
    expect(await screen.findByRole('region', { name: 'Files' })).toBeInTheDocument()
  })

  it('opens a gist file in the editor', async () => {
    renderSidebar()
    await userEvent.click(row('Gists'))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    expect(onOpenFile).toHaveBeenCalledWith('# notes', {
      gistId: 'abc123',
      filename: 'notes.md',
    })
  })

  it('remembers the picked gist when the panel is reopened', async () => {
    renderSidebar()
    await userEvent.click(row('Gists'))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await screen.findByRole('button', { name: 'notes.md' })

    await userEvent.click(row('Files'))
    await userEvent.click(row('Files'))

    expect(await screen.findByRole('button', { name: 'notes.md' })).toBeInTheDocument()
  })

  it('leaves the description empty when the gist has none, rather than showing a filename', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        { id: 'abc123', description: null, filename: 'notes.md', fileCount: 1, isPublic: false },
      ],
    })
    renderSidebar()
    await userEvent.click(row('Gists'))
    await userEvent.click(await screen.findByRole('button', { name: /1 file/ }))

    const panel = await screen.findByRole('region', { name: 'Files' })
    expect(within(panel).getByText('No description')).toBeInTheDocument()
  })

  it('shows one panel at a time', async () => {
    renderSidebar()
    await userEvent.click(row('Gists'))
    expect(await screen.findByText('A snippet')).toBeInTheDocument()

    await userEvent.click(row('GitHub'))

    expect(screen.queryByText('A snippet')).not.toBeInTheDocument()
    expect(screen.getByLabelText('GitHub personal access token')).toBeInTheDocument()
  })

  it('closes the open panel when its row is selected again', async () => {
    renderSidebar()
    await userEvent.click(row('Gists'))
    expect(await screen.findByText('A snippet')).toBeInTheDocument()

    await userEvent.click(row('Gists'))
    expect(screen.queryByText('A snippet')).not.toBeInTheDocument()
  })

  it('swaps the mark for the avatar in the rail once a token is connected', async () => {
    renderSidebar()
    await userEvent.click(row('GitHub'))
    await userEvent.type(screen.getByLabelText('GitHub personal access token'), 'github_pat_123')
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }))

    expect(await screen.findByAltText('@soroushm')).toHaveAttribute('src', AVATAR)
    expect(screen.getByText('Connected as @soroushm')).toBeInTheDocument()
  })

  it('falls back to an initial when the stored account has no avatar', async () => {
    githubApi.status.mockResolvedValue({
      success: true,
      data: { login: 'soroushm', avatar: null },
    })
    renderSidebar()

    expect(await screen.findByText('S')).toBeInTheDocument()
  })
})
