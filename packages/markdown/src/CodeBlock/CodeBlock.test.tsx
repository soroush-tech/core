import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, createTheme, baseTheme } from '@soroush.tech/design-system/theme'
import { CodeBlock } from './CodeBlock'
import { syntaxDark } from './CodeBlock.data'

const theme = createTheme(baseTheme, { syntax: syntaxDark })
const renderWithTheme = (ui: ReactNode) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

const writeText = vi.fn()

beforeEach(() => {
  writeText.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('CodeBlock', () => {
  it('renders the code inside a <pre> alongside a copy button', () => {
    const { container } = renderWithTheme(
      <CodeBlock>
        <code>const x = 1</code>
      </CodeBlock>
    )
    expect(container.querySelector('pre')).toHaveTextContent('const x = 1')
    // Focusable so keyboard users can scroll an overflowing block.
    expect(container.querySelector('pre')).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('copies the block text without its trailing newline, then confirms', async () => {
    renderWithTheme(
      <CodeBlock>
        <code>{'line one\nline two\n'}</code>
      </CodeBlock>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('line one\nline two')

    // Waits for the clipboard promise to resolve and the confirmation state to apply.
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('does not copy when the block is empty', () => {
    renderWithTheme(
      <CodeBlock>
        <code>{''}</code>
      </CodeBlock>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).not.toHaveBeenCalled()
  })
})
