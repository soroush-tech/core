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

const githubApi = {
  status: vi.fn().mockResolvedValue({ success: true, data: { login: null, avatar: null } }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  openTokenSettings: vi.fn(),
}

const gistsApi = {
  list: vi.fn().mockResolvedValue({ success: true, data: [] }),
  files: vi.fn().mockResolvedValue({ success: true, data: [] }),
  draft: vi.fn().mockResolvedValue({ success: true, data: { files: {} } }),
  stage: vi.fn().mockResolvedValue({ success: true, data: { files: {} } }),
  stageDescription: vi.fn().mockResolvedValue({ success: true, data: { files: {} } }),
  reset: vi.fn(),
  publish: vi.fn(),
  onDraftChanged: vi.fn((_callback: (change: unknown) => void) => vi.fn()),
}

vi.stubGlobal('editorAPI', {
  file: fileApi,
  claude: claudeApi,
  menu: menuApi,
  github: githubApi,
  gists: gistsApi,
})

/** Fires an application-menu action the way the preload bridge would. */
const dispatchMenu = (action: MenuAction) => act(async () => menuListener!(action))

beforeEach(() => {
  vi.clearAllMocks()
  fileApi.setDirty.mockResolvedValue({ success: true, data: null })
  githubApi.status.mockResolvedValue({ success: true, data: { login: null, avatar: null } })
  gistsApi.draft.mockResolvedValue({ success: true, data: { files: {} } })
  gistsApi.stage.mockResolvedValue({ success: true, data: { files: {} } })
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

  it('rewrites only what was selected, even if the selection went away meanwhile', async () => {
    let answer!: (value: unknown) => void
    claudeApi.editSelection.mockReturnValue(new Promise((resolve) => (answer = resolve)))
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'shout it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    // Clicking into the document while Claude works collapses the selection.
    source.setSelectionRange(11, 11)
    fireEvent.select(source)

    await act(async () => answer({ success: true, data: 'HELLO' }))

    // The answer was about those five characters, so it replaces those — not
    // the whole document.
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

  it('loads a gist file into the document, unbacked by any file path', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    expect(await screen.findByLabelText('Markdown source')).toHaveValue('# from a gist')
    // The title names the gist file, and saving it means the sandbox.
    expect(screen.getByRole('button', { name: 'Save to sandbox' })).toBeInTheDocument()
  })

  it('saves a gist file into the sandbox rather than to disk', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))
    await userEvent.type(await screen.findByLabelText('Markdown source'), '!')

    await dispatchMenu('save')

    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'notes.md', {
      status: 'modified',
      content: '# from a gist!',
    })
    expect(fileApi.save).not.toHaveBeenCalled()
    // Staged counts as saved — the document is clean, so Save goes quiet.
    expect(screen.getByRole('button', { name: 'Save to sandbox' })).toBeDisabled()
  })

  it('leaves the document dirty when staging fails', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    gistsApi.stage.mockResolvedValue({ success: false, error: 'EACCES' })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))
    await userEvent.type(await screen.findByLabelText('Markdown source'), '!')

    await dispatchMenu('save')
    // Nothing was staged, so the document is still unsaved and Save stays live.
    expect(screen.getByRole('button', { name: 'Save to sandbox' })).toBeEnabled()
  })

  it('saves through the button as well as the menu', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    // A clean document has nothing to save.
    expect(await screen.findByRole('button', { name: 'Save to sandbox' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Markdown source'), '!')
    await userEvent.click(screen.getByRole('button', { name: 'Save to sandbox' }))

    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'notes.md', {
      status: 'modified',
      content: '# from a gist!',
    })
  })

  it('offers a plain Save for a document that is not from a gist', async () => {
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Markdown source'), 'hi')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(fileApi.save).toHaveBeenCalledWith(null, 'hi')
  })

  it('reopens a saved gist file with the staged content, not the published one', async () => {
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
      data: [
        { filename: 'notes.md', content: '# notes' },
        { filename: 'todo.md', content: '# todo' },
      ],
    })
    // A sandbox that remembers and announces, the way main's does.
    let draft: { files: Record<string, unknown> } = { files: {} }
    const listeners: ((change: unknown) => void)[] = []
    gistsApi.onDraftChanged.mockImplementation((callback: (change: unknown) => void) => {
      listeners.push(callback)
      return vi.fn()
    })
    gistsApi.draft.mockImplementation(() => Promise.resolve({ success: true, data: draft }))
    gistsApi.stage.mockImplementation((id: string, filename: string, entry: unknown) => {
      draft = { files: { ...draft.files, [filename]: entry } }
      for (const listener of listeners) listener({ gistId: id, draft })
      return Promise.resolve({ success: true, data: draft })
    })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))

    // Open notes.md, edit it, save it into the sandbox.
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))
    await userEvent.type(await screen.findByLabelText('Markdown source'), '!')
    await userEvent.click(screen.getByRole('button', { name: 'Save to sandbox' }))

    // Go to another file, then come back.
    await userEvent.click(await screen.findByRole('button', { name: 'todo.md' }))
    expect(screen.getByLabelText('Markdown source')).toHaveValue('# todo')

    await userEvent.click(await screen.findByRole('button', { name: 'notes.md — modified' }))

    expect(screen.getByLabelText('Markdown source')).toHaveValue('# notes!')
  })

  it('still writes a gist file to disk on Save As', async () => {
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    await dispatchMenu('save-as')

    expect(fileApi.save).toHaveBeenLastCalledWith(null, '# from a gist')
    expect(gistsApi.stage).not.toHaveBeenCalled()
  })

  it('keeps the document when a dirty gist load is cancelled', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: false, error: 'no window' })
    gistsApi.list.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'abc123',
          description: 'A snippet',
          filename: 'notes.md',
          fileCount: 1,
          isPublic: false,
        },
      ],
    })
    gistsApi.files.mockResolvedValue({
      success: true,
      data: [{ filename: 'notes.md', content: '# from a gist' }],
    })
    render(<App />)
    await userEvent.type(screen.getByLabelText('Markdown source'), 'mine')

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    expect(screen.getByLabelText('Markdown source')).toHaveValue('mine')
  })

  it('shows IPC failures as an alert', async () => {
    fileApi.open.mockResolvedValue({ success: false, error: 'EACCES' })
    render(<App />)
    await dispatchMenu('open')
    expect(screen.getByRole('alert')).toHaveTextContent('EACCES')
  })
})
