import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

const fileApi = {
  open: vi.fn(),
  save: vi.fn(),
  setDirty: vi.fn().mockResolvedValue({ success: true, data: null }),
  confirmDiscard: vi.fn(),
}
const claudeApi = { editSelection: vi.fn() }

vi.stubGlobal('editorAPI', { file: fileApi, claude: claudeApi })

beforeEach(() => {
  vi.clearAllMocks()
  fileApi.setDirty.mockResolvedValue({ success: true, data: null })
})

describe('App', () => {
  it('renders an untitled, clean document', () => {
    render(<App />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
    expect(screen.getByLabelText('Markdown source')).toHaveValue('')
  })

  it('marks the title dirty while typing', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText('Markdown source'), 'hi')
    expect(screen.getByText(/Untitled\s*•/)).toBeInTheDocument()
  })

  it('drives New/Open/Save/Save As through the file API', async () => {
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByLabelText('Markdown source')).toHaveValue('# notes')
    expect(screen.getByText('C:\\notes.md')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(fileApi.save).toHaveBeenLastCalledWith('C:\\notes.md', '# notes')

    await userEvent.click(screen.getByRole('button', { name: 'Save As' }))
    expect(fileApi.save).toHaveBeenLastCalledWith(null, '# notes')

    await userEvent.click(screen.getByRole('button', { name: 'New' }))
    expect(screen.getByLabelText('Markdown source')).toHaveValue('')
  })

  it('undoes and redoes typed edits from the toolbar', async () => {
    render(<App />)
    const source = screen.getByLabelText('Markdown source')
    await userEvent.type(source, 'hi')

    const undoButton = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undoButton).toBeEnabled(), { timeout: 2000 })

    await userEvent.click(undoButton)
    expect(source).toHaveValue('')

    await userEvent.click(screen.getByRole('button', { name: 'Redo' }))
    expect(source).toHaveValue('hi')
  })

  it('replaces the selection with a Claude rewrite', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'HELLO' })
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    expect(screen.getByText('Selection · 5 characters')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'shout it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('hello', 'shout it')
    await waitFor(() => expect(source).toHaveValue('HELLO world'))
  })

  it('shows IPC failures as an alert', async () => {
    fileApi.open.mockResolvedValue({ success: false, error: 'EACCES' })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('alert')).toHaveTextContent('EACCES')
  })
})
