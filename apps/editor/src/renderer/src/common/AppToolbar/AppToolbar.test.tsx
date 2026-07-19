import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { editorTheme } from '../../theme/editorTheme'
import { AppToolbar, type AppToolbarProps } from './AppToolbar'

const actions = {
  onNew: vi.fn(),
  onOpen: vi.fn(),
  onSave: vi.fn(),
  onSaveAs: vi.fn(),
}

const renderToolbar = (props: Partial<AppToolbarProps> = {}) =>
  render(
    <ThemeProvider theme={editorTheme}>
      <AppToolbar filePath={null} isDirty={false} {...actions} {...props} />
    </ThemeProvider>
  )

beforeEach(() => vi.clearAllMocks())

describe('AppToolbar', () => {
  it('shows Untitled for a pathless clean document', () => {
    renderToolbar()
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('shows the file path with a dirty marker', () => {
    renderToolbar({ filePath: 'C:\\notes.md', isDirty: true })
    expect(screen.getByText(/C:\\notes\.md\s*•/)).toBeInTheDocument()
  })

  it.each([
    ['New', 'onNew'],
    ['Open', 'onOpen'],
    ['Save', 'onSave'],
    ['Save As', 'onSaveAs'],
  ] as const)('fires %s', async (label, handler) => {
    renderToolbar()
    await userEvent.click(screen.getByRole('button', { name: label }))
    expect(actions[handler]).toHaveBeenCalledTimes(1)
  })
})
