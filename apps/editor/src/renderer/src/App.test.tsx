import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MenuAction } from '../../shared/ipc'
import { App } from './App'

const fileApi = {
  open: vi.fn(),
  save: vi.fn(),
  setDirty: vi.fn().mockResolvedValue({ success: true, data: null }),
  confirmDiscard: vi.fn(),
}
const claudeApi = { editSelection: vi.fn() }

let menuListener: ((action: MenuAction) => void) | undefined
const menuApi = {
  onAction: vi.fn((callback: (action: MenuAction) => void) => {
    menuListener = callback
    return vi.fn()
  }),
}

vi.stubGlobal('editorAPI', { file: fileApi, claude: claudeApi, menu: menuApi })

/** Fires an application-menu action the way the preload bridge would. */
const dispatchMenu = (action: MenuAction) => act(async () => menuListener!(action))

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

  it('drives New/Open/Save/Save As through the menu actions', async () => {
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    await dispatchMenu('open')
    expect(screen.getByLabelText('Markdown source')).toHaveValue('# notes')
    expect(screen.getByText('C:\\notes.md')).toBeInTheDocument()

    await dispatchMenu('save')
    expect(fileApi.save).toHaveBeenLastCalledWith('C:\\notes.md', '# notes')

    await dispatchMenu('save-as')
    expect(fileApi.save).toHaveBeenLastCalledWith(null, '# notes')

    await dispatchMenu('new')
    expect(screen.getByLabelText('Markdown source')).toHaveValue('')
  })

  it('undoes and redoes typed edits from the menu actions', async () => {
    render(<App />)
    const source = screen.getByLabelText('Markdown source')
    await userEvent.type(source, 'hi')

    await dispatchMenu('undo')
    expect(source).toHaveValue('')

    await dispatchMenu('redo')
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

  it('writes a whole document from an instruction when nothing is selected', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: '# An article' })
    render(<App />)
    expect(screen.getByText('No selection — Claude edits the whole document.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'write an article')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('', 'write an article')
    await waitFor(() =>
      expect(screen.getByLabelText('Markdown source')).toHaveValue('# An article')
    )
  })

  it('rewrites the whole document when the caret is placed without a selection', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'rewritten doc' })
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'rewrite it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('hello world', 'rewrite it')
    await waitFor(() => expect(source).toHaveValue('rewritten doc'))
  })

  it('shows IPC failures as an alert', async () => {
    fileApi.open.mockResolvedValue({ success: false, error: 'EACCES' })
    render(<App />)
    await dispatchMenu('open')
    expect(screen.getByRole('alert')).toHaveTextContent('EACCES')
  })
})
