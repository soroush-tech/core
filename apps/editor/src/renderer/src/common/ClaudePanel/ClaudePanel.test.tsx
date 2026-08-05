import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import type { ClaudeEvent } from '../../../../shared/ipc'
import { editorTheme } from '../../theme/editorTheme'
import { GIST_DRAG_TYPE } from '../../utils/gistDrag'
import { ClaudePanel } from './ClaudePanel'

let listener: ((event: ClaudeEvent) => void) | undefined

const claudeApi = {
  startEdit: vi.fn(),
  cancel: vi.fn(),
  onEvent: vi.fn((callback: (event: ClaudeEvent) => void) => {
    listener = callback
    return vi.fn()
  }),
}

const gistsApi = { list: vi.fn(), files: vi.fn() }

vi.stubGlobal('editorAPI', { claude: claudeApi, gists: gistsApi })

const GIST = {
  id: 'abc123',
  description: 'Rehydration',
  filename: 'en.md',
  fileCount: 1,
  isPublic: false,
}

const onApply = vi.fn(() => true)

const renderPanel = (targetText = '', isSelection = false, documentName = 'en.md') =>
  render(
    <ThemeProvider theme={editorTheme}>
      <ClaudePanel
        targetText={targetText}
        isSelection={isSelection}
        documentName={documentName}
        onApply={onApply}
      />
    </ThemeProvider>
  )

/** Sends what main would send for the run in flight. */
const emit = (event: ClaudeEvent) => act(() => listener!(event))

/** Types an instruction and asks, leaving the run open. */
const ask = async (instruction: string) => {
  await userEvent.type(screen.getByLabelText('Edit instruction'), instruction)
  await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  claudeApi.startEdit.mockResolvedValue({ success: true, data: 'run-1' })
  claudeApi.cancel.mockResolvedValue({ success: true, data: null })
  gistsApi.list.mockResolvedValue({ success: true, data: [GIST] })
  gistsApi.files.mockResolvedValue({
    success: true,
    data: { description: 'Rehydration', files: [{ filename: 'en.md', content: '# Part one' }] },
  })
})

/** A drag carrying one of this app's gists. */
const dragging = (gistId: string) => ({
  types: [GIST_DRAG_TYPE],
  getData: (type: string) => (type === GIST_DRAG_TYPE ? gistId : ''),
})

describe('ClaudePanel', () => {
  it('targets the whole document when nothing is selected', async () => {
    renderPanel('', false)
    // Named, so it is plain which file an instruction is about to rewrite.
    expect(screen.getByText('en.md · empty')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Claude' })).toBeDisabled()

    await ask('write an article')
    expect(claudeApi.startEdit).toHaveBeenCalledWith('', 'write an article', null)

    await emit({ type: 'RUN_FINISHED', runId: 'run-1', text: 'an article' })
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('an article'))
  })

  it('shows the selection summary and a truncated preview', () => {
    renderPanel('x'.repeat(150), true)
    expect(screen.getByText('Selection · 150 characters')).toBeInTheDocument()
    expect(screen.getByText(`${'x'.repeat(120)}…`)).toBeInTheDocument()
  })

  it('shows the file and a taste of it when nothing is selected', () => {
    renderPanel('# A heading\n\nand the body that follows it', false, 'notes.md')

    expect(screen.getByText('notes.md · 41 characters')).toBeInTheDocument()
    // On one line: a markdown document is mostly newlines otherwise.
    expect(screen.getByText('# A heading and the body that follows it')).toBeInTheDocument()
  })

  it('submits the selection with the instruction and applies the rewrite', async () => {
    renderPanel('old text', true)

    await ask('improve it')
    expect(claudeApi.startEdit).toHaveBeenCalledWith('old text', 'improve it', null)

    await emit({ type: 'RUN_FINISHED', runId: 'run-1', text: 'better text' })

    await waitFor(() => expect(onApply).toHaveBeenCalledWith('better text'))
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('')
  })

  it('writes the answer into the document as it arrives', async () => {
    renderPanel('old text', true)
    await ask('improve')

    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'bett' })
    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'er' })

    // Everything so far each time — the document shows it taking shape.
    expect(onApply.mock.calls).toEqual([['bett'], ['better']])

    await emit({ type: 'RUN_FINISHED', runId: 'run-1', text: 'better text' })

    // And the run's own answer has the last word.
    expect(onApply).toHaveBeenLastCalledWith('better text')
  })

  it('shows a progress bar while the run is in flight', async () => {
    renderPanel('old text', true)
    await ask('improve')

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ask Claude' })).not.toBeInTheDocument()
  })

  it('stops a run on Cancel, putting back what was there', async () => {
    renderPanel('old text', true)
    await ask('improve')

    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'half an answer' })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(claudeApi.cancel).toHaveBeenCalledWith('run-1')
    // A half-written answer is not something to leave in the document.
    expect(onApply).toHaveBeenLastCalledWith('old text')
    // Back to idle, with the instruction kept for another go.
    expect(await screen.findByRole('button', { name: 'Ask Claude' })).toBeInTheDocument()
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('improve')
  })

  it('surfaces run errors and restores the document', async () => {
    renderPanel('old text', true)
    await ask('improve')
    await emit({ type: 'TEXT_MESSAGE_CONTENT', runId: 'run-1', delta: 'half an answer' })

    await emit({ type: 'RUN_ERROR', runId: 'run-1', error: 'not signed in' })

    expect(await screen.findByRole('alert')).toHaveTextContent('not signed in')
    expect(onApply).toHaveBeenLastCalledWith('old text')
    // The failed instruction stays for a retry.
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('improve')
  })

  it('says so when the answer could not be applied', async () => {
    onApply.mockReturnValueOnce(false)
    renderPanel('old text', true)

    await ask('improve')
    await emit({ type: 'RUN_FINISHED', runId: 'run-1', text: 'better text' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The document changed while Claude was working — the edit was not applied.'
    )
    // Asking again should not mean typing the instruction out a second time.
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('improve')
  })

  describe('writing from an existing gist', () => {
    const instructionField = () => screen.getByLabelText('Edit instruction')

    /** Drags a gist out of the Gists panel and drops it on the instruction. */
    const drop = async (gistId = 'abc123') => {
      fireEvent.drop(instructionField(), { dataTransfer: dragging(gistId) })
      await screen.findByText(/Writing from/)
    }

    it('sends the dropped gist as background material with the instruction', async () => {
      renderPanel('', false)

      await drop()
      expect(screen.getByText('Writing from Rehydration')).toBeInTheDocument()

      await ask('now write the part about data fetching')

      expect(claudeApi.startEdit).toHaveBeenCalledWith(
        '',
        'now write the part about data fetching',
        '# Rehydration\n\n## en.md\n# Part one'
      )
    })

    it('chooses the same gist from the keyboard, without a drag', async () => {
      renderPanel('', false)

      const picker = await screen.findByLabelText('Gist to write from')
      await userEvent.selectOptions(picker, 'abc123')

      expect(await screen.findByText('Writing from Rehydration')).toBeInTheDocument()

      await ask('now write the part about data fetching')
      expect(claudeApi.startEdit).toHaveBeenCalledWith(
        '',
        'now write the part about data fetching',
        '# Rehydration\n\n## en.md\n# Part one'
      )
    })

    it('names a gist that has no description by what it holds', async () => {
      gistsApi.list.mockResolvedValue({
        success: true,
        data: [{ ...GIST, description: '   ', fileCount: 3 }],
      })
      renderPanel('', false)

      expect(await screen.findByRole('option', { name: 'Untitled · 3 files' })).toBeInTheDocument()
    })

    it('names a gist holding one file in the singular', async () => {
      gistsApi.list.mockResolvedValue({ success: true, data: [{ ...GIST, description: null }] })
      renderPanel('', false)

      expect(await screen.findByRole('option', { name: 'Untitled · 1 file' })).toBeInTheDocument()
    })

    it('offers no picker when there is no gist to choose', async () => {
      gistsApi.list.mockResolvedValue({ success: false, error: 'Connect a GitHub account' })
      renderPanel('', false)

      await waitFor(() => expect(gistsApi.list).toHaveBeenCalled())
      // Signed out looks the same as an empty account from here, and an empty
      // list would say nothing either way.
      expect(screen.queryByLabelText('Gist to write from')).not.toBeInTheDocument()
    })

    it('goes back to offering the choice once the reference is dropped', async () => {
      renderPanel('', false)

      const picker = await screen.findByLabelText('Gist to write from')
      await userEvent.selectOptions(picker, 'abc123')
      await screen.findByText('Writing from Rehydration')

      await userEvent.click(screen.getByRole('button', { name: 'Stop writing from Rehydration' }))

      expect(screen.queryByText(/Writing from/)).not.toBeInTheDocument()
      expect(screen.getByLabelText('Gist to write from')).toHaveValue('')
    })

    it('offers the drop through the placeholder, so nothing takes space', () => {
      renderPanel('', false)

      fireEvent.dragOver(instructionField(), { dataTransfer: dragging('abc123') })
      expect(instructionField()).toHaveAttribute('placeholder', 'Drop to write from this gist')

      fireEvent.dragLeave(instructionField())
      expect(instructionField()).toHaveAttribute('placeholder', 'Describe the change…')
    })

    it.each([
      [
        'dragged text',
        { types: ['text/plain'], getData: (type: string) => (type === 'text/plain' ? 'hi' : '') },
      ],
      ['a gist drag carrying no gist', { types: [GIST_DRAG_TYPE], getData: () => '' }],
    ])('ignores %s', async (_name, dataTransfer) => {
      renderPanel('', false)

      fireEvent.drop(instructionField(), { dataTransfer })

      await ask('write something')
      expect(claudeApi.startEdit).toHaveBeenCalledWith('', 'write something', null)
    })

    it('does not offer the drop for anything that is not a gist', () => {
      renderPanel('', false)

      fireEvent.dragOver(instructionField(), {
        dataTransfer: { types: ['text/plain'], getData: () => 'hi' },
      })

      expect(instructionField()).toHaveAttribute('placeholder', 'Describe the change…')
    })

    it('refers to nothing until a gist is dropped', async () => {
      renderPanel('old text', true)

      await ask('improve')

      expect(claudeApi.startEdit).toHaveBeenCalledWith('old text', 'improve', null)
      expect(gistsApi.files).not.toHaveBeenCalled()
    })

    it.each([
      ['no description', null],
      ['one that is nothing but spaces', '   '],
    ])('gives the gist back its own name when it has %s', async (_name, description) => {
      gistsApi.files.mockResolvedValue({
        success: true,
        data: { description, files: [{ filename: 'en.md', content: '# Part one' }] },
      })
      renderPanel('', false)

      await drop()

      expect(screen.getByText('Writing from en.md')).toBeInTheDocument()
    })

    it('has something to call a gist with neither description nor files', async () => {
      gistsApi.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })
      renderPanel('', false)

      await drop()

      expect(screen.getByText('Writing from that gist')).toBeInTheDocument()
    })

    it('stops writing from the gist when that is cleared', async () => {
      renderPanel('', false)
      await drop()

      await userEvent.click(screen.getByRole('button', { name: 'Stop writing from Rehydration' }))

      await ask('write something new')
      expect(claudeApi.startEdit).toHaveBeenCalledWith('', 'write something new', null)
    })

    it('says when a gist was too long to send whole', async () => {
      gistsApi.files.mockResolvedValue({
        success: true,
        data: {
          description: 'Rehydration',
          files: [{ filename: 'en.md', content: 'x'.repeat(70_000) }],
        },
      })
      renderPanel('', false)

      await drop()

      expect(
        screen.getByText('Writing from Rehydration · first 60,000 characters')
      ).toBeInTheDocument()
    })

    it('reports a gist it could not read', async () => {
      gistsApi.files.mockResolvedValue({ success: false, error: 'GitHub responded 404' })
      renderPanel('', false)

      fireEvent.drop(instructionField(), { dataTransfer: dragging('abc123') })

      expect(await screen.findByRole('alert')).toHaveTextContent('GitHub responded 404')
    })
  })

  it('surfaces a run that could not be started', async () => {
    claudeApi.startEdit.mockResolvedValue({ success: false, error: 'Invalid edit request' })
    renderPanel('old text', true)

    await ask('improve')

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid edit request')
    // Nothing was written over, so putting the text back changes nothing.
    expect(onApply).toHaveBeenCalledWith('old text')
  })
})
