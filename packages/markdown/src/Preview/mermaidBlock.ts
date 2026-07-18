import { isValidElement, type ReactElement, type ReactNode } from 'react'

export const MERMAID_LANGUAGE = 'language-mermaid'

// The raw text of a fenced block — react-markdown passes the code content as `children`.
// A `mermaid` fence is unhighlighted (highlight.js has no such language), so `children` is
// the plain source; normalise arrays and drop the trailing newline.
export function mermaidSource(children: ReactNode): string {
  const text = Array.isArray(children) ? children.join('') : String(children ?? '')
  return text.replace(/\n$/, '')
}

// A `<pre>` whose only child is a mermaid code block — the child element carries the
// `language-mermaid` class. Rendering that child directly (instead of wrapping it in
// `CodeBlock`) lets the diagram stand on its own.
export function isMermaidBlock(children: ReactNode): children is ReactElement {
  if (!isValidElement(children)) return false
  const { className } = children.props as { className?: string }
  return typeof className === 'string' && className.includes(MERMAID_LANGUAGE)
}
