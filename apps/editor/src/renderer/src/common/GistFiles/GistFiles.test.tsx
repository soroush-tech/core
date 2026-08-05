import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import type { GistDraft } from '../../../../shared/ipc'
import { editorTheme } from '../../theme/editorTheme'
import { GistFiles } from './GistFiles'

const gistsApi = {
  list: vi.fn(),
  files: vi.fn(),
  draft: vi.fn(),
  drafts: vi.fn(),
  stage: vi.fn(),
  renameFile: vi.fn(),
  stageDescription: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
  onDraftChanged: vi.fn(() => vi.fn()),
}

vi.stubGlobal('editorAPI', { gists: gistsApi })

const onOpenFile = vi.fn()
const onRenamed = vi.fn()

const renderFiles = (gistId: string | null = 'abc123') =>
  render(
    <ThemeProvider theme={editorTheme}>
      <GistFiles gistId={gistId} onOpenFile={onOpenFile} onRenamed={onRenamed} />
    </ThemeProvider>
  )

/** What main would return for a draft holding exactly these changes. */
const staged = (draft: Partial<GistDraft>) => ({
  success: true,
  data: { files: {}, ...draft },
})

/** Opens the name field and types into it — the only way to add a file. */
const addFile = async (typed: string) => {
  await userEvent.click(screen.getByRole('button', { name: 'Add file' }))
  await userEvent.type(screen.getByLabelText('New filename'), typed)
}

const descriptionField = () => screen.getByLabelText('Gist description')
const editDescription = () => screen.getByRole('button', { name: 'Edit description' })

beforeEach(() => {
  vi.clearAllMocks()
  gistsApi.files.mockResolvedValue({
    success: true,
    data: {
      description: 'A snippet',
      files: [
        { filename: 'notes.md', content: '# notes' },
        { filename: 'todo.md', content: '# todo' },
      ],
    },
  })
  gistsApi.draft.mockResolvedValue(staged({}))
  gistsApi.stage.mockResolvedValue(staged({}))
  gistsApi.renameFile.mockResolvedValue(staged({}))
  gistsApi.stageDescription.mockResolvedValue(staged({}))
  gistsApi.reset.mockResolvedValue({ success: true, data: true })
  gistsApi.publish.mockResolvedValue({ success: true, data: null })
})

describe('GistFiles', () => {
  it('prompts for a gist before one is selected', () => {
    renderFiles(null)

    expect(screen.getByText('Select a gist to see its files.')).toBeInTheDocument()
    expect(gistsApi.files).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Gist description')).not.toBeInTheDocument()
  })

  it('lists the gist files', async () => {
    renderFiles()

    expect(await screen.findByRole('button', { name: 'notes.md' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'todo.md' })).toBeInTheDocument()
  })

  it('hands the chosen file to the editor, tagged with its gist', async () => {
    renderFiles()
    await userEvent.click(await screen.findByRole('button', { name: 'todo.md' }))

    expect(onOpenFile).toHaveBeenCalledWith('# todo', { gistId: 'abc123', filename: 'todo.md' })
  })

  it('opens the staged content, not what GitHub still has', async () => {
    gistsApi.draft.mockResolvedValue(
      staged({ files: { 'notes.md': { status: 'modified', content: '# saved locally' } } })
    )
    renderFiles()

    await userEvent.click(await screen.findByRole('button', { name: 'notes.md — modified' }))

    expect(onOpenFile).toHaveBeenCalledWith('# saved locally', {
      gistId: 'abc123',
      filename: 'notes.md',
    })
  })

  it('shows nothing to publish while the sandbox is empty', async () => {
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
  })

  it('marks staged files and counts the changes', async () => {
    gistsApi.draft.mockResolvedValue(
      staged({
        files: {
          'notes.md': { status: 'modified', content: 'edited' },
          'todo.md': { status: 'deleted' },
          'draft.md': { status: 'added', content: '' },
        },
      })
    )
    renderFiles()

    expect(await screen.findByRole('button', { name: 'notes.md — modified' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'todo.md — deleted' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'draft.md — added' })).toBeInTheDocument()
    expect(screen.getByText('3 unpublished changes')).toBeInTheDocument()
  })

  it('asks for a name only once Add file is pressed', async () => {
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    expect(screen.queryByLabelText('New filename')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add file' }))
    expect(screen.getByLabelText('New filename')).toBeInTheDocument()
  })

  it('stages a new file locally rather than calling GitHub', async () => {
    gistsApi.stage.mockResolvedValue(
      staged({ files: { 'new-file.md': { status: 'added', content: '' } } })
    )
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    await addFile('new-file.md{Enter}')

    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'new-file.md', {
      status: 'added',
      content: '',
    })
    expect(onOpenFile).toHaveBeenCalledWith('', { gistId: 'abc123', filename: 'new-file.md' })
    // The field has done its job and steps aside for the button again.
    expect(screen.queryByLabelText('New filename')).not.toBeInTheDocument()
    expect(await screen.findByText('1 unpublished change')).toBeInTheDocument()
  })

  it('keeps the typed name when staging it fails', async () => {
    gistsApi.stage.mockResolvedValue({ success: false, error: 'EACCES' })
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    await addFile('new-file.md{Enter}')

    expect(screen.getByLabelText('New filename')).toHaveValue('new-file.md')
    expect(onOpenFile).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('EACCES')
  })

  it.each([
    ['a name the gist already has', 'notes.md{Enter}'],
    ['a blank name', '   {Enter}'],
  ])('refuses %s, without staging', async (_name, typed) => {
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    await addFile(typed)

    expect(gistsApi.stage).not.toHaveBeenCalled()
    // Still open, so the name can be corrected rather than typed again.
    expect(screen.getByLabelText('New filename')).toBeInTheDocument()
  })

  it.each([
    ['Escape', async () => userEvent.keyboard('{Escape}')],
    ['clicking away', async () => userEvent.tab()],
  ])('abandons the new file on %s', async (_name, abandon) => {
    renderFiles()
    await screen.findByRole('button', { name: 'notes.md' })

    await addFile('new-file.md')
    await abandon()

    expect(gistsApi.stage).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('New filename')).not.toBeInTheDocument()
  })

  it('stages a deletion instead of deleting on GitHub', async () => {
    renderFiles()
    await userEvent.click(await screen.findByRole('button', { name: 'Delete notes.md' }))

    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'notes.md', { status: 'deleted' })
  })

  it('unstages a change when its row is undone', async () => {
    gistsApi.draft.mockResolvedValue(staged({ files: { 'notes.md': { status: 'deleted' } } }))
    renderFiles()

    await userEvent.click(await screen.findByRole('button', { name: 'Undo notes.md' }))
    expect(gistsApi.stage).toHaveBeenCalledWith('abc123', 'notes.md', null)
  })

  describe('renaming', () => {
    const rename = async (from: string, to: string) => {
      await userEvent.click(await screen.findByRole('button', { name: `Rename ${from}` }))
      await userEvent.clear(screen.getByLabelText(`Rename ${from}`))
      await userEvent.type(screen.getByLabelText(`Rename ${from}`), `${to}{Enter}`)
    }

    it('renames as one change, carrying the content across', async () => {
      renderFiles()
      await screen.findByRole('button', { name: 'notes.md' })

      await rename('notes.md', 'renamed.md')

      // Staging the deletion and the new name apart could lose the file between
      // them, so main is asked for the rename itself.
      expect(gistsApi.renameFile).toHaveBeenCalledWith(
        'abc123',
        'notes.md',
        'renamed.md',
        '# notes'
      )
      expect(gistsApi.stage).not.toHaveBeenCalled()
      // So a document open on that file saves under the name it now has.
      expect(onRenamed).toHaveBeenCalledWith('abc123', 'notes.md', 'renamed.md')
    })

    it('renames just as well with nobody listening', async () => {
      render(
        <ThemeProvider theme={editorTheme}>
          <GistFiles gistId="abc123" onOpenFile={onOpenFile} />
        </ThemeProvider>
      )
      await screen.findByRole('button', { name: 'notes.md' })

      await rename('notes.md', 'renamed.md')

      expect(gistsApi.renameFile).toHaveBeenCalledWith(
        'abc123',
        'notes.md',
        'renamed.md',
        '# notes'
      )
    })

    it('sends the staged content of a file that only exists locally', async () => {
      gistsApi.draft.mockResolvedValue(
        staged({ files: { 'draft.md': { status: 'added', content: '# draft' } } })
      )
      renderFiles()
      await screen.findByRole('button', { name: 'draft.md — added' })

      await rename('draft.md', 'renamed.md')

      expect(gistsApi.renameFile).toHaveBeenCalledWith(
        'abc123',
        'draft.md',
        'renamed.md',
        '# draft'
      )
    })

    it('leaves the open document on its old name when the rename fails', async () => {
      gistsApi.renameFile.mockResolvedValue({ success: false, error: 'EACCES' })
      renderFiles()
      await screen.findByRole('button', { name: 'notes.md' })

      await rename('notes.md', 'renamed.md')

      // Nothing was staged, so the document still belongs to the name it had.
      expect(onRenamed).not.toHaveBeenCalled()
      expect(await screen.findByRole('alert')).toHaveTextContent('EACCES')
    })

    it.each([
      ['the name is unchanged', 'notes.md'],
      ['the name is blank', '   '],
      ['the name is already taken', 'todo.md'],
    ])('stages nothing when %s', async (_name, to) => {
      renderFiles()
      await screen.findByRole('button', { name: 'notes.md' })

      await rename('notes.md', to)
      expect(gistsApi.stage).not.toHaveBeenCalled()
    })

    it('abandons the rename on Escape', async () => {
      renderFiles()
      await userEvent.click(await screen.findByRole('button', { name: 'Rename notes.md' }))
      await userEvent.type(screen.getByLabelText('Rename notes.md'), 'renamed.md{Escape}')

      expect(gistsApi.stage).not.toHaveBeenCalled()
      expect(await screen.findByRole('button', { name: 'notes.md' })).toBeInTheDocument()
    })

    it('abandons the rename when the field is left', async () => {
      renderFiles()
      await userEvent.click(await screen.findByRole('button', { name: 'Rename notes.md' }))
      await userEvent.type(screen.getByLabelText('Rename notes.md'), 'renamed.md')
      await userEvent.tab()

      expect(gistsApi.stage).not.toHaveBeenCalled()
    })

    it('offers no rename for a file staged for deletion', async () => {
      gistsApi.draft.mockResolvedValue(staged({ files: { 'notes.md': { status: 'deleted' } } }))
      renderFiles()
      await screen.findByRole('button', { name: 'notes.md — deleted' })

      expect(screen.queryByRole('button', { name: 'Rename notes.md' })).not.toBeInTheDocument()
    })
  })

  describe('the description', () => {
    it('reads as text until Edit is pressed', async () => {
      renderFiles()

      // It arrives with the gist itself now, not from the list row.
      expect(await screen.findByText('A snippet')).toBeInTheDocument()
      expect(screen.queryByLabelText('Gist description')).not.toBeInTheDocument()

      await userEvent.click(editDescription())
      expect(descriptionField()).toHaveValue('A snippet')
    })

    it('says so when the gist has none', () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      renderFiles()
      expect(screen.getByText('No description')).toBeInTheDocument()
    })

    it('edits over several lines, since Enter belongs to the text', async () => {
      renderFiles()
      await userEvent.click(editDescription())

      // A multiline field is a textarea, so Enter inserts a newline.
      expect(descriptionField().tagName).toBe('TEXTAREA')
      await userEvent.clear(descriptionField())
      await userEvent.type(descriptionField(), 'One line{Enter}And another')

      expect(gistsApi.stageDescription).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: 'Save description' }))

      expect(gistsApi.stageDescription).toHaveBeenCalledWith('abc123', 'One line\nAnd another')
    })

    it('stages what was typed on Save, and closes the editor', async () => {
      renderFiles()
      await userEvent.click(editDescription())
      await userEvent.clear(descriptionField())
      await userEvent.type(descriptionField(), 'A better one')
      await userEvent.click(screen.getByRole('button', { name: 'Save description' }))

      expect(gistsApi.stageDescription).toHaveBeenCalledWith('abc123', 'A better one')
      expect(screen.queryByLabelText('Gist description')).not.toBeInTheDocument()
    })

    it('stages nothing on Cancel, and forgets what was typed', async () => {
      renderFiles()
      await userEvent.click(editDescription())
      await userEvent.clear(descriptionField())
      await userEvent.type(descriptionField(), 'Never mind')
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(gistsApi.stageDescription).not.toHaveBeenCalled()
      expect(screen.getByText('A snippet')).toBeInTheDocument()

      await userEvent.click(editDescription())
      expect(descriptionField()).toHaveValue('A snippet')
    })

    it('stages nothing when Save is pressed on an untouched description', async () => {
      renderFiles()
      await userEvent.click(editDescription())
      await userEvent.click(screen.getByRole('button', { name: 'Save description' }))

      expect(gistsApi.stageDescription).not.toHaveBeenCalled()
    })

    it('clears the staged edit when the published description is typed back', async () => {
      gistsApi.draft.mockResolvedValue(staged({ description: 'A better one' }))
      renderFiles()
      expect(await screen.findByText('A better one')).toBeInTheDocument()

      await userEvent.click(editDescription())
      await userEvent.clear(descriptionField())
      await userEvent.type(descriptionField(), 'A snippet')
      await userEvent.click(screen.getByRole('button', { name: 'Save description' }))

      // Back to what GitHub has, so there is nothing left to publish.
      expect(gistsApi.stageDescription).toHaveBeenCalledWith('abc123', null)
    })

    it('shows the staged description and counts it as a change', async () => {
      gistsApi.draft.mockResolvedValue(staged({ description: 'A better one' }))
      renderFiles()

      expect(await screen.findByText('A better one')).toBeInTheDocument()
      expect(screen.getByText('Description edited — publish to apply it.')).toBeInTheDocument()
      expect(screen.getByText('1 unpublished change')).toBeInTheDocument()
    })

    it('stages an emptied description, which clears it on GitHub', async () => {
      renderFiles()
      await userEvent.click(editDescription())
      await userEvent.clear(descriptionField())
      await userEvent.click(screen.getByRole('button', { name: 'Save description' }))

      expect(gistsApi.stageDescription).toHaveBeenCalledWith('abc123', '')
    })
  })

  it('publishes the draft and reloads the gist', async () => {
    gistsApi.draft.mockResolvedValue(
      staged({ files: { 'notes.md': { status: 'modified', content: 'edited' } } })
    )
    renderFiles()

    await userEvent.click(await screen.findByRole('button', { name: 'Publish' }))

    expect(gistsApi.publish).toHaveBeenCalledWith('abc123', false)
    await waitFor(() => expect(gistsApi.files).toHaveBeenCalledTimes(2))
  })

  it('resets the draft and reloads the gist', async () => {
    gistsApi.draft.mockResolvedValue(
      staged({ files: { 'notes.md': { status: 'modified', content: 'edited' } } })
    )
    renderFiles()

    await userEvent.click(await screen.findByRole('button', { name: 'Reset' }))

    expect(gistsApi.reset).toHaveBeenCalledWith('abc123')
    await waitFor(() => expect(gistsApi.files).toHaveBeenCalledTimes(2))
  })

  it('surfaces a publish failure as an alert', async () => {
    gistsApi.draft.mockResolvedValue(
      staged({ files: { 'notes.md': { status: 'modified', content: 'edited' } } })
    )
    gistsApi.publish.mockResolvedValue({ success: false, error: 'GitHub responded 422' })
    renderFiles()

    await userEvent.click(await screen.findByRole('button', { name: 'Publish' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('GitHub responded 422')
  })

  it('surfaces a failure to load the files', async () => {
    gistsApi.files.mockResolvedValue({ success: false, error: 'GitHub responded 404' })
    renderFiles()

    expect(await screen.findByRole('alert')).toHaveTextContent('GitHub responded 404')
  })

  it('shows progress while the files load', () => {
    gistsApi.files.mockReturnValue(new Promise(() => {}))
    renderFiles()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
