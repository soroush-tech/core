import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { ClaudePanel } from './ClaudePanel'

const claudeApi = { editSelection: vi.fn() }

vi.stubGlobal('editorAPI', { claude: claudeApi })

const onApply = vi.fn()

const renderPanel = (selectedText = '') =>
  render(
    <ThemeProvider theme={editorTheme}>
      <ClaudePanel selectedText={selectedText} onApply={onApply} />
    </ThemeProvider>
  )

beforeEach(() => vi.clearAllMocks())

describe('ClaudePanel', () => {
  it('prompts to select text and keeps submit disabled without a selection', async () => {
    renderPanel()
    expect(screen.getByText(/Select text in the editor/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'improve')
    expect(screen.getByRole('button', { name: 'Ask Claude' })).toBeDisabled()
  })

  it('shows the selection summary and a truncated preview', () => {
    renderPanel('x'.repeat(150))
    expect(screen.getByText('Selection · 150 characters')).toBeInTheDocument()
    expect(screen.getByText(`${'x'.repeat(120)}…`)).toBeInTheDocument()
  })

  it('submits the selection with the instruction and applies the rewrite', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: true, data: 'better text' })
    renderPanel('old text')

    const instruction = screen.getByLabelText('Edit instruction')
    await userEvent.type(instruction, 'improve it')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(claudeApi.editSelection).toHaveBeenCalledWith('old text', 'improve it')
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('better text'))
    expect(instruction).toHaveValue('')
  })

  it('shows a progress bar while the request is in flight', async () => {
    claudeApi.editSelection.mockReturnValue(new Promise(() => {}))
    renderPanel('old text')
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'improve')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Claude' })).toBeDisabled()
  })

  it('surfaces bridge errors without applying anything', async () => {
    claudeApi.editSelection.mockResolvedValue({ success: false, error: 'not signed in' })
    renderPanel('old text')
    await userEvent.type(screen.getByLabelText('Edit instruction'), 'improve')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Claude' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('not signed in')
    expect(onApply).not.toHaveBeenCalled()
    // The failed instruction stays for a retry.
    expect(screen.getByLabelText('Edit instruction')).toHaveValue('improve')
  })
})
