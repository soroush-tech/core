import { render, screen } from '@testing-library/react'
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
})
