import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { NEW_GIST_PREFIX } from '../../../../shared/ipc'
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
  drafts: vi.fn(),
  stage: vi.fn(),
  stageDescription: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
  onDraftChanged: vi.fn(() => vi.fn()),
}

vi.stubGlobal('editorAPI', { github: githubApi, gists: gistsApi })

const onOpenFile = vi.fn()
const onRenameFile = vi.fn()

const renderSidebar = () =>
  render(
    <ThemeProvider theme={editorTheme}>
      <EditorSidebar onOpenFile={onOpenFile} onRenameFile={onRenameFile} />
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
    data: { description: null, files: [{ filename: 'notes.md', content: '# notes' }] },
  })
  gistsApi.draft.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.stage.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.stageDescription.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.publish.mockResolvedValue({ success: true, data: null })
  gistsApi.drafts.mockResolvedValue({ success: true, data: {} })
})

describe('EditorSidebar', () => {
  it('opens on a sandbox, ready for a file or a description', async () => {
    renderSidebar()

    expect(await screen.findByText('New gist')).toBeInTheDocument()
    expect(row('Files')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Add file' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit description' })).toBeInTheDocument()
  })

  it('asks GitHub for nothing on startup', async () => {
    renderSidebar()
    await screen.findByText('New gist')

    // A gist that does not exist yet is answered locally.
    expect(gistsApi.list).not.toHaveBeenCalled()
    expect(gistsApi.drafts).not.toHaveBeenCalled()
    const [[requested]] = gistsApi.files.mock.calls as [string][]
    expect(requested).toContain(NEW_GIST_PREFIX)
  })

  it('leaves the other rows collapsed', async () => {
    renderSidebar()
    await screen.findByText('New gist')

    for (const name of ['Gists', 'Drafts', 'GitHub']) {
      expect(row(name)).toHaveAttribute('aria-expanded', 'false')
    }
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

  describe('the new-gist sandbox', () => {
    it('opens an empty Files panel, without asking GitHub for anything', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      renderSidebar()

      await userEvent.click(row('New gist'))

      expect(await screen.findByText('New gist')).toBeInTheDocument()
      expect(row('Files')).toHaveAttribute('aria-expanded', 'true')
      expect(gistsApi.list).not.toHaveBeenCalled()
    })

    it('starts a fresh gist each time, rather than reopening the last one', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      renderSidebar()

      await userEvent.click(row('New gist'))
      await screen.findByText('New gist')
      await userEvent.click(row('New gist'))

      const [[first], [second]] = gistsApi.files.mock.calls as [string][]
      expect(first).toContain(NEW_GIST_PREFIX)
      // A sandbox left unpublished stays where it is, reachable from Drafts.
      expect(second).not.toBe(first)
    })

    it('offers to create it rather than publish, secret unless asked', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      gistsApi.draft.mockResolvedValue({
        success: true,
        data: { files: { 'notes.md': { status: 'added', content: '# notes' } } },
      })
      renderSidebar()
      await userEvent.click(row('New gist'))

      const create = await screen.findByRole('button', { name: 'Create gist' })
      expect(screen.getByRole('checkbox', { name: 'Public gist' })).not.toBeChecked()

      await userEvent.click(create)
      expect(gistsApi.publish).toHaveBeenCalledWith(expect.stringContaining(NEW_GIST_PREFIX), false)
    })

    it('creates a public gist when that is asked for', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      gistsApi.draft.mockResolvedValue({
        success: true,
        data: { files: { 'notes.md': { status: 'added', content: '# notes' } } },
      })
      renderSidebar()
      await userEvent.click(row('New gist'))

      // The checkbox's input is visually hidden, so click it directly.
      fireEvent.click(await screen.findByRole('checkbox', { name: 'Public gist' }))
      await userEvent.click(screen.getByRole('button', { name: 'Create gist' }))

      expect(gistsApi.publish).toHaveBeenCalledWith(expect.stringContaining(NEW_GIST_PREFIX), true)
    })

    it('keeps an existing gist selected after publishing it', async () => {
      gistsApi.draft.mockResolvedValue({
        success: true,
        data: { files: { 'notes.md': { status: 'modified', content: 'edited' } } },
      })
      renderSidebar()
      await userEvent.click(row('Gists'))
      await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))

      await userEvent.click(await screen.findByRole('button', { name: 'Publish' }))

      // Only the sandbox disappears on publish; a real gist stays open.
      expect(await screen.findByRole('button', { name: 'notes.md' })).toBeInTheDocument()
    })

    it('leaves the sandbox behind once the gist exists', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      gistsApi.draft.mockResolvedValue({
        success: true,
        data: { files: { 'notes.md': { status: 'added', content: '# notes' } } },
      })
      renderSidebar()
      await userEvent.click(row('New gist'))
      await userEvent.click(await screen.findByRole('button', { name: 'Create gist' }))

      expect(await screen.findByText('Select a gist to see its files.')).toBeInTheDocument()
    })
  })

  it('goes back to a gist through the draft list', async () => {
    gistsApi.drafts.mockResolvedValue({
      success: true,
      data: { def456: { files: { 'wip.md': { status: 'modified', content: 'half written' } } } },
    })
    renderSidebar()

    await userEvent.click(row('Drafts'))
    await userEvent.click(await screen.findByRole('button', { name: 'wip.md' }))

    // The draft opens straight into the files panel — no detour through the list.
    expect(row('Files')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Gists')).toHaveAttribute('aria-expanded', 'false')
    expect(gistsApi.files).toHaveBeenCalledWith('def456')
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
