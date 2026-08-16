import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme, baseTheme } from '@soroush.tech/design-system/theme'
import { syntaxDark } from '../CodeBlock/CodeBlock.data'
import { Control } from '../Control'
import { LiveEdit } from './LiveEdit'

// mermaid is browser-only and lazily imported by <Mermaid>; stub it so a ```mermaid block
// renders in jsdom.
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"></svg>' }),
  },
}))

const syntaxTheme = createTheme(baseTheme, { syntax: syntaxDark })

const CONTENT = '# Title\n\nFirst paragraph.\n\nSecond paragraph.'

const renderLiveEdit = (value: string, onChange = vi.fn()) => {
  render(
    <ThemeProvider theme={syntaxTheme}>
      <LiveEdit value={value} onChange={onChange} />
    </ThemeProvider>
  )
  return onChange
}

/** Controlled harness so committed edits flow back into `value` like in a real app. */
function Harness({ initial }: Readonly<{ initial: string }>) {
  const [value, setValue] = useState(initial)
  return (
    <ThemeProvider theme={syntaxTheme}>
      <LiveEdit value={value} onChange={setValue} />
    </ThemeProvider>
  )
}

const blocks = () => screen.getAllByLabelText('Edit block')

/** Simulates the browser mutating a contentEditable block's DOM, then the input event. */
const editBlock = (block: HTMLElement, html: string) => {
  block.innerHTML = html
  fireEvent.input(block)
}

describe('LiveEdit', () => {
  it('renders every block through the preview, directly editable', () => {
    renderLiveEdit(CONTENT)
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
    expect(blocks()).toHaveLength(3)
    for (const block of blocks()) expect(block).toHaveAttribute('contenteditable', 'true')
  })

  it('splices an edited block back into the document live', () => {
    const onChange = renderLiveEdit(CONTENT)
    editBlock(blocks()[1], '<p>Rewritten <strong>with bold</strong>.</p>')
    expect(onChange).toHaveBeenCalledWith(
      '# Title\n\nRewritten **with bold**.\n\nSecond paragraph.'
    )
  })

  it('keeps later offsets valid across consecutive edits without a blur', () => {
    const onChange = renderLiveEdit(CONTENT)
    editBlock(blocks()[1], '<p>A much longer first paragraph than before.</p>')
    editBlock(blocks()[2], '<p>End.</p>')
    expect(onChange).toHaveBeenLastCalledWith(
      '# Title\n\nA much longer first paragraph than before.\n\nEnd.'
    )
  })

  it('re-splits on blur so paragraph splits become their own blocks', () => {
    render(<Harness initial={CONTENT} />)
    editBlock(blocks()[2], '<p>Second paragraph.</p><p>A third one.</p>')
    expect(blocks()).toHaveLength(3)

    fireEvent.blur(blocks()[2])
    expect(blocks()).toHaveLength(4)
    expect(screen.getByText('A third one.')).toBeInTheDocument()
  })

  it('blurs the block on Escape and stays put on other keys', () => {
    renderLiveEdit(CONTENT)
    const [block] = blocks()
    block.focus()
    expect(block).toHaveFocus()
    fireEvent.keyDown(block, { key: 'a' })
    expect(block).toHaveFocus()
    fireEvent.keyDown(block, { key: 'Escape' })
    expect(block).not.toHaveFocus()
  })

  it('starts an empty document from the placeholder block', () => {
    render(<Harness initial="" />)
    const [block] = blocks()
    expect(block).toHaveAttribute('data-placeholder', 'Click to start writing...')

    // Typed characters are literal text - WYSIWYG, not markdown syntax.
    editBlock(block, 'Fresh start')
    fireEvent.blur(block)
    expect(screen.getByText('Fresh start')).toBeInTheDocument()
    expect(blocks()[0]).not.toHaveAttribute('data-placeholder')
  })

  it('keeps mermaid diagram blocks read-only', () => {
    renderLiveEdit('A paragraph.\n\n```mermaid\ngraph TD\n```')
    const [text, diagram] = blocks()
    expect(text).toHaveAttribute('contenteditable', 'true')
    expect(diagram).toHaveAttribute('contenteditable', 'false')
    expect(diagram).not.toHaveAttribute('tabindex')
  })

  it('re-splits when the value changes externally', () => {
    const ui = (value: string) => (
      <ThemeProvider theme={syntaxTheme}>
        <LiveEdit value={value} onChange={vi.fn()} />
      </ThemeProvider>
    )
    const { rerender } = render(ui('One block.'))
    expect(blocks()).toHaveLength(1)
    rerender(ui('# Replaced\n\nBy two.'))
    expect(blocks()).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 1, name: 'Replaced' })).toBeInTheDocument()
  })

  it('is driven by the Control context when composed', () => {
    const onChange = vi.fn()
    render(
      <ThemeProvider theme={syntaxTheme}>
        <Control value="A paragraph." onChange={onChange}>
          <LiveEdit />
        </Control>
      </ThemeProvider>
    )
    editBlock(screen.getByLabelText('Edit block'), '<p>A paragraph. Extended.</p>')
    expect(onChange).toHaveBeenCalledWith('A paragraph. Extended.')
  })

  it('forwards slotProps to every block preview', () => {
    render(
      <ThemeProvider theme={syntaxTheme}>
        <LiveEdit value="plain text" onChange={vi.fn()} slotProps={{ p: { color: 'primary' } }} />
      </ThemeProvider>
    )
    expect(screen.getByText('plain text')).toHaveStyle({ color: '#00FC40' })
  })

  it('keeps the fence language when a code block is edited in place', () => {
    const onChange = renderLiveEdit('```js\nconst a = 1\n```')
    const [block] = blocks()
    // The rendered code element carries language-js; simulate typing inside it.
    const code = block.querySelector('code')!
    code.textContent = 'const a = 2\n'
    fireEvent.input(block)
    expect(onChange).toHaveBeenCalledWith('```js\nconst a = 2\n```')
  })

  it('tolerates missing handlers outside a Control', () => {
    render(
      <ThemeProvider theme={syntaxTheme}>
        <LiveEdit />
      </ThemeProvider>
    )
    const block = screen.getByLabelText('Edit block')
    // Without a Control there is no value or onChange to reach, so editing and
    // blurring must be inert rather than calling into undefined.
    expect(() => {
      editBlock(block, 'typed')
      fireEvent.blur(block)
    }).not.toThrow()
  })
})
