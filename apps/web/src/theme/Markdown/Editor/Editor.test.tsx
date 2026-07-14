import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { Control } from 'src/theme/Markdown/Control'
import { Editor } from './Editor'

function Harness({ initialValue = '' }: Readonly<{ initialValue?: string }>) {
  const [value, setValue] = useState(initialValue)
  return (
    <Control value={value} onChange={setValue}>
      <Editor />
    </Control>
  )
}

// Standalone (no Control) — the Editor is a plain controlled field via value/onChange.
function StandaloneHarness({ initialValue = '' }: Readonly<{ initialValue?: string }>) {
  const [value, setValue] = useState(initialValue)
  return <Editor value={value} onChange={setValue} />
}

const source = () => screen.getByRole('textbox', { name: 'Markdown source' }) as HTMLTextAreaElement

describe('Editor', () => {
  it('reflects typing into the source', () => {
    renderWithTheme(<Harness />)
    fireEvent.change(source(), { target: { value: '# Hi' } })
    expect(source()).toHaveValue('# Hi')
  })

  it('shows the shortcut hint by default and hides it when disabled', () => {
    const { unmount } = renderWithTheme(<Harness />)
    expect(screen.getByText(/Tab inserts a tab/)).toBeInTheDocument()
    unmount()

    renderWithTheme(
      <Control value="" onChange={() => {}}>
        <Editor showShortcutHint={false} />
      </Control>
    )
    expect(screen.queryByText(/Tab inserts a tab/)).toBeNull()
  })

  it('forwards appearance and form-field props to the source input', () => {
    renderWithTheme(
      <Control value="" onChange={() => {}}>
        <Editor
          variant="outlined"
          color="primary"
          textColor="secondary"
          size="lg"
          name="body"
          required
          error
        />
      </Control>
    )
    expect(source()).toHaveAttribute('name', 'body')
    expect(source()).toBeRequired()
  })

  it('inserts a tab character at the caret when Tab is pressed', () => {
    renderWithTheme(<Harness />)
    const el = source()
    fireEvent.change(el, { target: { value: 'ab' } })
    el.setSelectionRange(1, 1)
    fireEvent.select(el)
    fireEvent.keyDown(el, { key: 'Tab' })
    expect(source()).toHaveValue('a\tb')
    expect(el.selectionStart).toBe(2)
  })

  it('indents every line of a multi-line selection with Tab', () => {
    renderWithTheme(<Harness />)
    const el = source()
    fireEvent.change(el, { target: { value: 'a\nb' } })
    el.setSelectionRange(0, 3)
    fireEvent.keyDown(el, { key: 'Tab' })
    expect(source()).toHaveValue('\ta\n\tb')
  })

  it('releases focus with Ctrl/Cmd+Shift+M instead of typing', () => {
    renderWithTheme(<Harness initialValue="ab" />)
    const el = source()

    el.focus()
    expect(el).toHaveFocus()
    fireEvent.keyDown(el, { key: 'm', ctrlKey: true, shiftKey: true })
    expect(el).not.toHaveFocus()

    el.focus()
    fireEvent.keyDown(el, { key: 'M', metaKey: true, shiftKey: true })
    expect(el).not.toHaveFocus()
    expect(source()).toHaveValue('ab')
  })

  it('releases focus with Escape instead of typing', () => {
    renderWithTheme(<Harness initialValue="ab" />)
    const el = source()

    el.focus()
    expect(el).toHaveFocus()
    fireEvent.keyDown(el, { key: 'Escape' })
    expect(el).not.toHaveFocus()
    expect(source()).toHaveValue('ab')
  })

  it('announces the shortcut hint via aria-describedby', () => {
    const { unmount } = renderWithTheme(<Harness />)
    expect(source()).toHaveAccessibleDescription(/Tab inserts a tab/)
    unmount()

    renderWithTheme(
      <Control value="" onChange={() => {}}>
        <Editor showShortcutHint={false} />
      </Control>
    )
    expect(source()).not.toHaveAttribute('aria-describedby')
  })

  it('works standalone (without a Control) via value/onChange', () => {
    renderWithTheme(<StandaloneHarness />)
    const el = source()
    fireEvent.change(el, { target: { value: 'hi' } })
    expect(source()).toHaveValue('hi')
    el.setSelectionRange(2, 2)
    fireEvent.select(el) // no-op without a Control, but exercises the standalone path
    fireEvent.keyDown(el, { key: 'Tab' })
    expect(source()).toHaveValue('hi\t')
  })

  it('renders and no-ops with neither context nor value/onChange', () => {
    renderWithTheme(<Editor />)
    expect(source()).toHaveValue('')
    fireEvent.change(source(), { target: { value: 'x' } })
    expect(source()).toHaveValue('') // no onChange — controlled value stays empty
  })

  it('ignores Shift+Tab and other key combos', () => {
    renderWithTheme(<Harness />)
    const el = source()
    fireEvent.change(el, { target: { value: 'ab' } })
    el.setSelectionRange(1, 1)
    fireEvent.keyDown(el, { key: 'Tab', shiftKey: true })
    fireEvent.keyDown(el, { key: 'm', ctrlKey: true })
    fireEvent.keyDown(el, { key: 'x', ctrlKey: true, shiftKey: true })
    expect(source()).toHaveValue('ab')
  })
})
