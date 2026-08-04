import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { GistList } from './GistList'

const gistsApi = { list: vi.fn() }

vi.stubGlobal('editorAPI', { gists: gistsApi })

const gist = (overrides: Record<string, unknown> = {}) => ({
  id: 'abc123',
  description: 'A useful snippet',
  filename: 'notes.md',
  fileCount: 2,
  isPublic: true,
  ...overrides,
})

const onSelect = vi.fn()

const renderList = (selectedId: string | null = null) =>
  render(
    <ThemeProvider theme={editorTheme}>
      <GistList selectedId={selectedId} onSelect={onSelect} />
    </ThemeProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.list.mockResolvedValue({ success: true, data: [gist()] })
})

describe('GistList', () => {
  it('shows progress until the gists arrive', async () => {
    gistsApi.list.mockReturnValue(new Promise(() => {}))
    renderList()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('lists each gist by its description, with a file-count summary', async () => {
    renderList()

    expect(await screen.findByText('A useful snippet')).toBeInTheDocument()
    expect(screen.getByText('2 files · Public')).toBeInTheDocument()
  })

  it('singularises a one-file gist and marks a secret one', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [gist({ fileCount: 1, isPublic: false })],
    })
    renderList()

    expect(await screen.findByText('1 file · Secret')).toBeInTheDocument()
  })

  it('falls back to the summary alone when the gist has no description', async () => {
    gistsApi.list.mockResolvedValue({ success: true, data: [gist({ description: null })] })
    renderList()

    expect(await screen.findByText('2 files · Public')).toBeInTheDocument()
    expect(screen.queryByText('A useful snippet')).not.toBeInTheDocument()
  })

  it('says so when the account has no gists', async () => {
    gistsApi.list.mockResolvedValue({ success: true, data: [] })
    renderList()

    expect(await screen.findByText('No gists yet.')).toBeInTheDocument()
  })

  it('reports the picked gist to the rail', async () => {
    renderList()
    await userEvent.click(await screen.findByRole('button', { name: /A useful snippet/ }))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc123' }))
  })

  it('marks the gist whose files are showing', async () => {
    renderList('abc123')

    expect(await screen.findByRole('button', { name: /A useful snippet/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('surfaces a failure as an alert instead of an empty list', async () => {
    gistsApi.list.mockResolvedValue({
      success: false,
      error: 'Connect a GitHub account to see your gists',
    })
    renderList()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Connect a GitHub account to see your gists'
    )
    expect(screen.queryByText('No gists yet.')).not.toBeInTheDocument()
  })
})
