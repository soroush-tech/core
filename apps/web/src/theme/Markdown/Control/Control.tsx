import { useRef, type ReactNode } from 'react'
import { applyAction } from 'src/theme/Markdown/utils/applyAction'
import {
  MarkdownContext,
  type MarkdownContextValue,
  type MarkdownSelection,
} from 'src/theme/Markdown/MarkdownContext'
import type { ToolbarAction } from 'src/theme/Markdown/const'

export interface ControlProps {
  /** Current markdown source (controlled). */
  value: string
  /** Called with the next source on edit or a toolbar action. */
  onChange: (value: string) => void
  /** The composed parts — `Markdown.Toolbar`, `Markdown.Editor`, `Markdown.Preview`, … */
  children: ReactNode
}

/**
 * The headless root of the Markdown compound: owns the shared value/selection state and exposes
 * it (plus a `dispatch` for toolbar actions) via context. It renders no UI of its own — the
 * consumer arranges the parts and decides which panes to show.
 */
export function Control({ value, onChange, children }: Readonly<ControlProps>) {
  const lastSelectionRef = useRef<MarkdownSelection | null>(null)
  const pendingSelectionRef = useRef<MarkdownSelection | null>(null)

  const dispatch = (action: ToolbarAction) => {
    const { start, end } = lastSelectionRef.current ?? { start: value.length, end: value.length }
    const next = applyAction(action, { value, selectionStart: start, selectionEnd: end })
    const selection = { start: next.selectionStart, end: next.selectionEnd }
    pendingSelectionRef.current = selection
    lastSelectionRef.current = selection
    onChange(next.value)
  }

  const rememberSelection = (selection: MarkdownSelection) => {
    lastSelectionRef.current = selection
  }

  const queueSelection = (selection: MarkdownSelection) => {
    pendingSelectionRef.current = selection
    lastSelectionRef.current = selection
  }

  const takeQueuedSelection = () => {
    const selection = pendingSelectionRef.current
    pendingSelectionRef.current = null
    return selection
  }

  const context: MarkdownContextValue = {
    value,
    onChange,
    dispatch,
    rememberSelection,
    queueSelection,
    takeQueuedSelection,
  }

  return <MarkdownContext.Provider value={context}>{children}</MarkdownContext.Provider>
}
