import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { CodeBlock } from './CodeBlock'

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

    // Flush the clipboard promise so the confirmation state applies.
    await act(async () => {})
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
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
