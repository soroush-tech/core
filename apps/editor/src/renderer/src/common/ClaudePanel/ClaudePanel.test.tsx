import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { ClaudePanel } from './ClaudePanel'

const claudeApi = { editSelection: vi.fn() }

vi.stubGlobal('editorAPI', { claude: claudeApi })

const onApply = vi.fn()

const renderPanel = (targetText = '', isSelection = false) =>
  render(
    <ThemeProvider theme={editorTheme}>
      <ClaudePanel targetText={targetText} isSelection={isSelection} onApply={onApply} />
    </ThemeProvider>
  )

beforeEach(() => vi.clearAllMocks())

describe('ClaudePanel', () => {
  it('targets the whole document when nothing is selected', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'an article' })
    renderPanel('', false)
    expect(screen.getByText('No selection — Claude edits the whole document.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Claude' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Edit instruction'), 'write an article')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('', 'write an article')
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('an article'))
  })

  it('shows the selection summary and a truncated preview', () => {
    renderPanel('x'.repeat(150), true)
    expect(screen.getByText('Selection · 150 characters')).toBeInTheDocument()
    expect(screen.getByText(`${'x'.repeat(120)}…`)).toBeInTheDocument()
  })

  it('submits the selection with the instruction and applies the rewrite', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'better text' })
    renderPanel('old text', true)

    const instruction = screen.getByLabelText('Edit instruction')
    await userEvent.type(instruction, 'improve it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('old text', 'improve it')
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('better text'))
    expect(instruction).toHaveValue('')
  })

  it('shows a progress bar while the request is in flight', async () => {
    claudeApi.editSelection.mockReturnValue(new Promise(() => {}))
    renderPanel('old text', true)
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'improve')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Claude' })).toBeDisabled()
  })

  it('surfaces bridge errors without applying anything', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: false, error: 'not signed in' })
    renderPanel('old text', true)
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'improve')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('not signed in')
    expect(onApply).not.toHaveBeenCalled()
    // The failed instruction stays for a retry.
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('improve')
  })
})
