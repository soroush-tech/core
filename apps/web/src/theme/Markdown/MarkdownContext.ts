import { createContext, useContext } from 'react'
import type { ToolbarAction } from 'src/theme/Markdown/const'

/** A textarea selection range shared between the Editor and the Toolbar. */
export interface MarkdownSelection {
  start: number
  end: number
}

export interface MarkdownContextValue {
  /** Current markdown source. */
  value: string
  /** Called with the next source on edit or a toolbar action. */
  onChange: (value: string) => void
  /** Applies a toolbar action at the last remembered selection and queues the caret to restore. */
  dispatch: (action: ToolbarAction) => void
  /** Records the current textarea selection — the Editor calls this on select/blur. */
  rememberSelection: (selection: MarkdownSelection) => void
  /** Queues a selection to restore after the next value change (e.g. after Tab). */
  queueSelection: (selection: MarkdownSelection) => void
  /** Returns and clears the queued selection — the Editor's effect calls this to restore focus. */
  takeQueuedSelection: () => MarkdownSelection | null
}

export const MarkdownContext = createContext<MarkdownContextValue | null>(null)

/** Reads the Markdown compound context; throws if used outside `<Markdown.Control>`. */
export function useMarkdownContext(): MarkdownContextValue {
  const context = useContext(MarkdownContext)
  if (!context) {
    throw new Error('Markdown parts must be rendered inside <Markdown.Control>')
  }
  return context
}
