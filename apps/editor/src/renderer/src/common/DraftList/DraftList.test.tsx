import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { DraftList } from './DraftList'

let announce: ((change: { gistId: string; draft: unknown }) => void) | undefined

const gistsApi = {
  list: vi.fn(),
  drafts: vi.fn(),
  reset: vi.fn(),
  onDraftChanged: vi.fn((callback: (change: { gistId: string; draft: unknown }) => void) => {
    announce = callback
    return vi.fn()
  }),
}

vi.stubGlobal('editorAPI', { gists: gistsApi })

const onSelect = vi.fn()

const renderDrafts = (selectedId: string | null = null) =>
  render(
    <ThemeProvider theme={editorTheme}>
      <DraftList selectedId={selectedId} onSelect={onSelect} />
    </ThemeProvider>
  )

const DRAFTS = {
  abc123: { files: { 'notes.md': { status: 'modified' as const, content: 'edited' } } },
  def456: { files: {}, description: 'Just a rename' },
}

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.drafts.mockResolvedValue({ success: true, data: DRAFTS })
  gistsApi.reset.mockResolvedValue({ success: true, data: true })
  gistsApi.list.mockResolvedValue({
    success: true,
    data: [
      {
        id: 'abc123',
        description: 'Deploy notes',
        filename: 'notes.md',
        fileCount: 1,
        isPublic: false,
      },
    ],
  })
})

describe('DraftList', () => {
  it('shows progress until the drafts arrive', () => {
    gistsApi.drafts.mockReturnValue(new Promise(() => {}))
    renderDrafts()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('lists every gist with unpublished changes', async () => {
    renderDrafts()

    expect(await screen.findByText('Deploy notes')).toBeInTheDocument()
    expect(screen.getByText('Just a rename')).toBeInTheDocument()
    expect(screen.getAllByText('1 unpublished change')).toHaveLength(2)
  })

  it('counts several changes', async () => {
    gistsApi.drafts.mockResolvedValue({
      success: true,
      data: {
        abc123: {
          files: {
            'notes.md': { status: 'modified', content: 'edited' },
            'todo.md': { status: 'deleted' },
          },
          description: 'And a rename',
        },
      },
    })
    renderDrafts()

    expect(await screen.findByText('3 unpublished changes')).toBeInTheDocument()
  })

  it('goes back to the gist that was picked', async () => {
    renderDrafts()
    await userEvent.click(await screen.findByRole('button', { name: 'Deploy notes' }))

    expect(onSelect).toHaveBeenCalledWith('abc123')
  })

  it('marks the gist that is currently open', async () => {
    renderDrafts('abc123')

    expect(await screen.findByRole('button', { name: 'Deploy notes' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('discards a draft, leaving the confirmation to main', async () => {
    renderDrafts()
    await userEvent.click(await screen.findByRole('button', { name: 'Discard Deploy notes' }))

    expect(gistsApi.reset).toHaveBeenCalledWith('abc123')
  })

  it('keeps the row when the discard is cancelled', async () => {
    // Cancelling announces nothing, so the row simply stays.
    gistsApi.reset.mockResolvedValue({ success: true, data: false })
    renderDrafts()
    await userEvent.click(await screen.findByRole('button', { name: 'Discard Deploy notes' }))

    expect(screen.getByText('Deploy notes')).toBeInTheDocument()
  })

  it('surfaces a discard that failed', async () => {
    gistsApi.reset.mockResolvedValue({ success: false, error: 'EACCES' })
    renderDrafts()
    await userEvent.click(await screen.findByRole('button', { name: 'Discard Deploy notes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('EACCES')
  })

  it('says so when there is nothing unpublished', async () => {
    gistsApi.drafts.mockResolvedValue({ success: true, data: {} })
    renderDrafts()

    expect(await screen.findByText('Nothing unpublished.')).toBeInTheDocument()
  })

  it('surfaces a failure as an alert instead of an empty list', async () => {
    gistsApi.drafts.mockResolvedValue({ success: false, error: 'EACCES' })
    renderDrafts()

    expect(await screen.findByRole('alert')).toHaveTextContent('EACCES')
    expect(screen.queryByText('Nothing unpublished.')).not.toBeInTheDocument()
  })

  it('takes up a draft staged elsewhere, without refetching', async () => {
    gistsApi.drafts.mockResolvedValue({ success: true, data: {} })
    renderDrafts()
    await screen.findByText('Nothing unpublished.')

    act(() =>
      announce!({
        gistId: 'ghi789',
        draft: { files: { 'fresh.md': { status: 'added', content: '' } } },
      })
    )

    expect(await screen.findByText('fresh.md')).toBeInTheDocument()
    expect(gistsApi.drafts).toHaveBeenCalledTimes(1)
  })

  it('drops a gist once its draft is published or reset', async () => {
    renderDrafts()
    await screen.findByText('Deploy notes')

    act(() => announce!({ gistId: 'abc123', draft: { files: {} } }))

    expect(screen.queryByText('Deploy notes')).not.toBeInTheDocument()
    expect(screen.getByText('Just a rename')).toBeInTheDocument()
  })
})
