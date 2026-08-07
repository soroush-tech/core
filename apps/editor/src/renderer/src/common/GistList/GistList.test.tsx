import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { GIST_DRAG_TYPE } from '../../utils/gistDrag'
import { GISTS_PER_PAGE } from './const'
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

  describe('pagination', () => {
    /** More gists than fit on one page, each findable by its number. */
    const many = (count: number) =>
      Array.from({ length: count }, (_, index) =>
        gist({ id: `gist-${String(index)}`, description: `Gist ${String(index)}` })
      )

    it('stays out of the way when everything fits on one page', async () => {
      gistsApi.list.mockResolvedValue({ success: true, data: many(GISTS_PER_PAGE) })
      renderList()
      await screen.findByText('Gist 0')

      expect(screen.queryByRole('navigation', { name: 'Gist pages' })).not.toBeInTheDocument()
    })

    it('shows only a page of gists at a time', async () => {
      gistsApi.list.mockResolvedValue({ success: true, data: many(GISTS_PER_PAGE + 3) })
      renderList()

      expect(await screen.findByText('Gist 0')).toBeInTheDocument()
      expect(screen.getByText(`Gist ${String(GISTS_PER_PAGE - 1)}`)).toBeInTheDocument()
      expect(screen.queryByText(`Gist ${String(GISTS_PER_PAGE)}`)).not.toBeInTheDocument()
      expect(screen.getByText(`${String(GISTS_PER_PAGE + 3)} gists`)).toBeInTheDocument()
    })

    it('moves to the next page', async () => {
      gistsApi.list.mockResolvedValue({ success: true, data: many(GISTS_PER_PAGE + 3) })
      renderList()
      await screen.findByText('Gist 0')

      await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))

      expect(screen.getByText(`Gist ${String(GISTS_PER_PAGE)}`)).toBeInTheDocument()
      expect(screen.queryByText('Gist 0')).not.toBeInTheDocument()
    })

    it('goes back to an earlier page', async () => {
      gistsApi.list.mockResolvedValue({ success: true, data: many(GISTS_PER_PAGE + 3) })
      renderList()
      await screen.findByText('Gist 0')

      await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))
      await userEvent.click(screen.getByRole('button', { name: 'Go to page 1' }))

      expect(screen.getByText('Gist 0')).toBeInTheDocument()
    })
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

  it('lets a gist be dragged onto the Claude panel to write from', async () => {
    renderList()
    const row = await screen.findByRole('button', { name: /A useful snippet/ })
    expect(row).toHaveAttribute('draggable', 'true')

    const dataTransfer = { setData: vi.fn(), effectAllowed: 'none' }
    fireEvent.dragStart(row, { dataTransfer })

    expect(dataTransfer.setData).toHaveBeenCalledWith(GIST_DRAG_TYPE, 'abc123')
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
