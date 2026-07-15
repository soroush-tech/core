import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { MarkdownContext, type MarkdownContextValue } from '../MarkdownContext'
import { HEADING_ACTIONS, TOOLBAR_ACTIONS } from '../const'
import { Toolbar } from './Toolbar'

const dispatch = vi.fn()

const context: MarkdownContextValue = {
  value: '',
  onChange: vi.fn(),
  dispatch,
  rememberSelection: vi.fn(),
  queueSelection: vi.fn(),
  takeQueuedSelection: vi.fn(() => null),
}

const renderToolbar = () =>
  renderWithTheme(
    <MarkdownContext.Provider value={context}>
      <Toolbar />
    </MarkdownContext.Provider>
  )

const clusterOf = (buttonName: string) =>
  within(screen.getByRole('button', { name: buttonName }).closest('[role="group"]') as HTMLElement)

beforeEach(() => {
  dispatch.mockClear()
})

describe('Toolbar', () => {
  it('renders one button per action plus the inline-code and table-picker controls', () => {
    renderToolbar()
    // +1 for the inline-code button (beside the code select), +1 for the table trigger.
    expect(screen.getAllByRole('button')).toHaveLength(TOOLBAR_ACTIONS.length + 2)
  })

  it('exposes each action by its accessible label', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Horizontal rule' })).toBeInTheDocument()
  })

  it('dispatches the clicked action', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    expect(dispatch).toHaveBeenCalledWith(TOOLBAR_ACTIONS.find((a) => a.id === 'bold'))
  })

  it('dispatches the chosen heading level', () => {
    renderToolbar()
    fireEvent.change(screen.getByRole('combobox', { name: 'Heading level' }), {
      target: { value: 'h4' },
    })
    expect(dispatch).toHaveBeenCalledWith(HEADING_ACTIONS.find((a) => a.id === 'h4'))
  })

  it('joins bold, italic and strikethrough into a single button cluster', () => {
    renderToolbar()
    const cluster = clusterOf('Bold')
    for (const name of ['Bold', 'Italic', 'Strikethrough']) {
      expect(cluster.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('joins the bulleted, numbered and task lists into a single button cluster', () => {
    renderToolbar()
    const cluster = clusterOf('Bulleted list')
    for (const name of ['Bulleted list', 'Numbered list', 'Task list']) {
      expect(cluster.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('renders an icon for the icon-based actions', () => {
    renderToolbar()
    const names = [
      'Inline code',
      'Blockquote',
      'Link',
      'Image',
      'Bulleted list',
      'Numbered list',
      'Task list',
      'Table',
    ]
    for (const name of names) {
      expect(screen.getByRole('button', { name }).querySelector('svg')).toBeInTheDocument()
    }
  })

  it('dispatches a fenced code block with the chosen language', () => {
    renderToolbar()
    fireEvent.change(screen.getByRole('combobox', { name: 'Code block language' }), {
      target: { value: 'html' },
    })
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'code-block', kind: 'wrap', prefix: '```html\n' })
    )
  })

  it('dispatches a generated table from the size picker', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2 by 2' }))
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'table',
        kind: 'insert',
        snippet: expect.stringContaining('| Column 1 | Column 2 |'),
      })
    )
  })
})
