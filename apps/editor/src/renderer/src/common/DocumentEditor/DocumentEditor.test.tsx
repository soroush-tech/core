import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { DocumentEditor } from './DocumentEditor'

const renderEditor = (value = '', onChange = vi.fn()) => {
  render(
    <ThemeProvider theme={editorTheme}>
      <DocumentEditor value={value} onChange={onChange} />
    </ThemeProvider>
  )
  return onChange
}

describe('DocumentEditor', () => {
  it('renders the formatting toolbar, source editor, and preview', () => {
    renderEditor('# Title')
    expect(screen.getByRole('toolbar', { name: 'Markdown formatting' })).toBeInTheDocument()
    expect(screen.getByLabelText('Markdown source')).toHaveValue('# Title')
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument()
  })

  it('propagates typing to onChange', async () => {
    const onChange = renderEditor()
    await userEvent.type(screen.getByLabelText('Markdown source'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('propagates toolbar actions to onChange', async () => {
    const onChange = renderEditor()
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onChange).toHaveBeenCalled()
  })

  it('reports textarea selection changes', () => {
    const onSelectionChange = vi.fn()
    render(
      <ThemeProvider theme={editorTheme}>
        <DocumentEditor
          value="hello world"
          onChange={vi.fn()}
          onSelectionChange={onSelectionChange}
        />
      </ThemeProvider>
    )
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    expect(onSelectionChange).toHaveBeenCalledWith({ start: 0, end: 5 })
  })

  it('ignores select events without a listener', () => {
    renderEditor('hello')
    fireEvent.select(screen.getByLabelText('Markdown source'))
  })

  it('switches to a read-only preview', async () => {
    renderEditor('# Title')
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Markdown source')).not.toBeInTheDocument()
    // The formatting toolbar stays available in every mode.
    expect(screen.getByRole('toolbar', { name: 'Markdown formatting' })).toBeInTheDocument()
  })

  it('switches to live edit and edits blocks in place', async () => {
    const onChange = renderEditor('A paragraph.')
    await userEvent.click(screen.getByRole('button', { name: 'Live edit' }))
    expect(screen.queryByLabelText('Markdown source')).not.toBeInTheDocument()

    const block = screen.getByLabelText('Edit block')
    expect(block).toHaveAttribute('contenteditable', 'true')
    // Simulate the browser mutating the contentEditable DOM, then the input event.
    block.innerHTML = '<p>A paragraph. Extended.</p>'
    fireEvent.input(block)
    expect(onChange).toHaveBeenCalledWith('A paragraph. Extended.')
  })

  it('returns to edit mode and keeps it when the active mode is re-clicked', async () => {
    renderEditor('# Title')
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Markdown source')).toBeInTheDocument()
    // Re-clicking the active mode toggles it "off" (null) — the surface stays put.
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Markdown source')).toBeInTheDocument()
  })

  it('resets the reported selection when the mode changes', async () => {
    const onSelectionChange = vi.fn()
    render(
      <ThemeProvider theme={editorTheme}>
        <DocumentEditor
          value="hello world"
          onChange={vi.fn()}
          onSelectionChange={onSelectionChange}
        />
      </ThemeProvider>
    )
    const source = screen.getByLabelText<HTMLTextAreaElement>('Markdown source')
    source.setSelectionRange(0, 5)
    fireEvent.select(source)
    expect(onSelectionChange).toHaveBeenLastCalledWith({ start: 0, end: 5 })

    await userEvent.click(screen.getByRole('button', { name: 'Live edit' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith({ start: 0, end: 0 })
  })
})
