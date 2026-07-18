import { type ReactNode } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent, screen } from '@testing-library/react'
import { ThemeProvider } from '@soroush.tech/design-system/ThemeProvider'
import { createTheme, baseTheme } from '@soroush.tech/design-system/themes'
import type { ThemeComponents } from '@emotion/react'
import { CodeBlock } from './CodeBlock'
import { Control } from './Control'
import { Editor } from './Editor'
import { Preview } from './Preview'
import { Toolbar } from './Toolbar'

afterEach(cleanup)

// A declaration no component sets on its own, so a match proves the override applied.
const MARKER = { textIndent: '7px' }

/**
 * Finds the rendered element whose emotion class carries the given styled
 * `label` — works across portals since it scans the whole document.
 */
function byLabel(label: string): HTMLElement {
  const matcher = new RegExp(`(^|\\s)css-[^ ]+-${label}(\\s|$)`)
  const match = Array.from(document.body.querySelectorAll<HTMLElement>('*')).find((element) =>
    matcher.test(element.getAttribute('class') ?? '')
  )
  if (!match) throw new Error(`no element rendered with emotion label "${label}"`)
  return match
}

interface Case {
  /** `theme.components` key receiving the styleOverrides. */
  name: keyof ThemeComponents
  /** The `styleOverrides` slot under test. */
  slot: string
  /** Emotion `label` of the styled element the override must land on. */
  label: string
  ui: ReactNode
  /** Post-render interaction that mounts the slot's element (e.g. opening the table picker). */
  open?: () => void
}

const cases: Case[] = [
  {
    name: 'MarkdownEditor',
    slot: 'root',
    label: 'MarkdownEditor',
    ui: (
      <Control value="" onChange={() => {}}>
        <Editor />
      </Control>
    ),
  },
  { name: 'MarkdownPreview', slot: 'root', label: 'MarkdownPreview', ui: <Preview>t</Preview> },
  { name: 'CodeBlock', slot: 'root', label: 'CodeBlock', ui: <CodeBlock>code</CodeBlock> },
  { name: 'CodeBlock', slot: 'surface', label: 'CodeSurface', ui: <CodeBlock>c</CodeBlock> },
  {
    name: 'MarkdownToolbar',
    slot: 'root',
    label: 'MarkdownToolbar',
    ui: (
      <Control value="" onChange={() => {}}>
        <Toolbar />
      </Control>
    ),
  },
  {
    name: 'MarkdownToolbar',
    slot: 'strike',
    label: 'MarkdownStrike',
    ui: (
      <Control value="" onChange={() => {}}>
        <Toolbar />
      </Control>
    ),
  },
  {
    name: 'MarkdownToolbar',
    slot: 'tablePickerCell',
    label: 'MarkdownEditorTableCell',
    ui: (
      <Control value="" onChange={() => {}}>
        <Toolbar />
      </Control>
    ),
    open: () => fireEvent.click(screen.getByRole('button', { name: 'Table' })),
  },
]

describe('theme.components styleOverrides', () => {
  it.each(cases)('$name applies styleOverrides.$slot', ({ name, slot, label, ui, open }) => {
    const theme = createTheme(baseTheme, {
      components: { [name]: { styleOverrides: { [slot]: MARKER } } },
    })
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
    open?.()
    expect(byLabel(label)).toHaveStyle(MARKER)
  })
})
