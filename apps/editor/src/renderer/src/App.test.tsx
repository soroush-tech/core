import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ClaudeEvent, MenuAction } from '../../shared/ipc'
import { App } from './App'

const fileApi = {
  open: vi.fn(),
  save: vi.fn(),
  setDirty: vi.fn().mockResolvedValue({ success: true, data: null }),
  confirmDiscard: vi.fn(),
}
let claudeListener: ((event: ClaudeEvent) => void) | undefined
const claudeApi = {
  startEdit: vi.fn(),
  cancel: vi.fn(),
  onEvent: vi.fn((callback: (event: ClaudeEvent) => void) => {
    claudeListener = callback
    return vi.fn()
  }),
}

/** Ends the run in flight the way main would, with its answer. */
const finishRun = (text: string) =>
  act(() => claudeListener!({ type: 'RUN_FINISHED', runId: 'run-1', text }))

/** Sends part of an answer, as the CLI does while it writes. */
const streamDelta = (delta: string) =>
  act(() => claudeListener!({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta }))

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
  files: vi.fn().mockResolvedValue({ success: true, data: { description: null, files: [] } }),
  draft: vi.fn(),
  // Keyed by gist id, so nothing staged anywhere is an empty record.
  drafts: vi.fn().mockResolvedValue({ success: true, data: {} }),
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
  claudeApi.startEdit.mockResolvedValue({ success: true, data: 'run-1' })
  claudeApi.cancel.mockResolvedValue({ success: true, data: null })
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

  it('settles on the sandbox, so what is written can be published', async () => {
    render(<App />)

    // The rail opens on a gist that does not exist yet; the document belongs to
    // a file in it, rather than to nothing.
    expect(await screen.findByText('en.md')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Save to sandbox' })).toBeInTheDocument()
  })

  it('marks the title dirty while typing', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText('Markdown source'), 'hi')
    expect(screen.getByText(/en\.md\s*•/)).toBeInTheDocument()
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
    expect(fileApi.save).toHaveBeenLastCalledWith('C:\\notes.md', '# notes', 'C:\\notes.md')

    // Save As proposes the name it already has rather than an empty dialog.
    await dispatchMenu('save-as')
    expect(fileApi.save).toHaveBeenLastCalledWith(null, '# notes', 'C:\\notes.md')

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
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    expect(screen.getByText('Selection · 5 characters')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'shout it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    expect(claudeApi.startEdit).toHaveBeenCalledWith('hello', 'shout it', null)

    // The document itself shows the answer being written, over the selection.
    await streamDelta('HEL')
    expect(source).toHaveValue('HEL world')
    await streamDelta('LO')
    expect(source).toHaveValue('HELLO world')

    await finishRun('HELLO')
    await waitFor(() => expect(source).toHaveValue('HELLO world'))
  })

  it('puts the document back when a run is cancelled mid-write', async () => {
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'rewrite it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    await streamDelta('half an ans')
    expect(source).toHaveValue('half an ans')

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(source).toHaveValue('hello world'))
  })

  it('drops the answer when the selected text is no longer where it was', async () => {
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'shout it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    // The document moves on while Claude works, so those five characters are
    // not the ones it was asked about any more.
    fireEvent.change(source, { target: { value: 'a different document' } })
    await finishRun('HELLO')

    // Writing the answer in at that range would have mangled what is there now.
    expect(source).toHaveValue('a different document')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The document changed while Claude was working — the edit was not applied.'
    )
  })

  it('drops a whole-document answer when the document changed meanwhile', async () => {
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello')

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'rewrite it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    fireEvent.change(source, { target: { value: 'hello, and more since' } })
    await finishRun('rewritten doc')

    // Claude was given the document as it was; replacing the newer one with
    // that answer would throw the difference away.
    expect(source).toHaveValue('hello, and more since')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The document changed while Claude was working — the edit was not applied.'
    )
  })

  it('drops the answer when another document holding the same text took over', async () => {
    fileApi.confirmDiscard.mockResolvedValue({ success: true, data: 'discard' })
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\other.md', content: 'hello' },
    })
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello')

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'shout it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    // Another file is opened while Claude works, and it happens to hold the
    // same text — which is not the same as being the document it was asked about.
    await dispatchMenu('open')
    await finishRun('HELLO')

    expect(source).toHaveValue('hello')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The document changed while Claude was working — the edit was not applied.'
    )
  })

  it('writes a whole document from an instruction when nothing is selected', async () => {
    render(<App />)
    // The whole document is the target, and the panel names which one.
    expect(screen.getByText('Untitled · empty')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'write an article')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    expect(claudeApi.startEdit).toHaveBeenCalledWith('', 'write an article', null)

    await finishRun('# An article')
    await waitFor(() =>
      expect(screen.getByLabelText('Markdown source')).toHaveValue('# An article')
    )
  })

  it('rewrites the whole document when the caret is placed without a selection', async () => {
    render(<App />)
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    await userEvent.type(source, 'hello world')

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'rewrite it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    expect(claudeApi.startEdit).toHaveBeenCalledWith('hello world', 'rewrite it', null)

    await finishRun('rewritten doc')
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
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
    fileApi.open.mockResolvedValue({
      success: true,
      data: { filePath: 'C:\\notes.md', content: '# notes' },
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    // Opening from disk takes the document out of the sandbox it started in.
    await dispatchMenu('open')
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Markdown source'), '!')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(fileApi.save).toHaveBeenCalledWith('C:\\notes.md', '# notes!', 'C:\\notes.md')
    expect(gistsApi.stage).not.toHaveBeenCalled()
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
      data: {
        description: null,
        files: [
          { filename: 'notes.md', content: '# notes' },
          { filename: 'todo.md', content: '# todo' },
        ],
      },
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
    })
    fileApi.save.mockResolvedValue({ success: true, data: { filePath: 'C:\\notes.md' } })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Gists' }))
    await userEvent.click(await screen.findByRole('button', { name: /A snippet/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'notes.md' }))

    await dispatchMenu('save-as')

    // The dialog opens on the gist's own filename, not on a blank one.
    expect(fileApi.save).toHaveBeenLastCalledWith(null, '# from a gist', 'notes.md')
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
      data: { description: null, files: [{ filename: 'notes.md', content: '# from a gist' }] },
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
