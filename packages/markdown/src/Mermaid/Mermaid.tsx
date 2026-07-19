import { useEffect, useId, useState } from 'react'
import type { Theme } from '@soroush.tech/design-system'
import { useTheme } from '@soroush.tech/design-system/theme'
import { CodeBlock } from '../CodeBlock'
import { DiagramViewer, type DiagramViewerProps } from './DiagramViewer'

/** DiagramViewer props a consumer may set — `svg` and `fill` are managed internally. */
export type DiagramProps = Omit<DiagramViewerProps, 'svg' | 'fill'>

export interface MermaidProps {
  /** The mermaid diagram source — the body of a ` ```mermaid ` fenced block. */
  chart: string
  /** Props forwarded to the diagram's zoom/pan viewer (e.g. `expandable`). */
  diagram?: DiagramProps
}

// Renders the diagram to an SVG string. `mermaid` is browser-only and heavy, so it is
// imported lazily inside the effect (never at module scope) — keeping the package SSR-safe
// and the library out of the initial bundle. `securityLevel: 'strict'` sanitizes the SVG,
// since the source can come from untrusted markdown.
async function toSvg(id: string, chart: string, theme: Theme): Promise<string> {
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    // Throw on an invalid diagram instead of drawing mermaid's built-in "Syntax error" graphic,
    // so `Mermaid` can fall back to the diagram source in a CodeBlock.
    suppressErrorRendering: true,
    theme: theme.colorScheme === 'dark' ? 'dark' : 'default',
    // A lean set of anchors mapped from the active design-system theme (surfaces from
    // `background`, the font from `fonts`); mermaid derives the rest (borders, secondary/tertiary,
    // notes, lines) from these. `darkMode` tracks the theme's `colorScheme` so derivations match a
    // light or dark consumer theme. Consumers override any variable — or add ones not anchored
    // here — via `theme.mermaid`, which is spread last so it always wins.
    themeVariables: {
      darkMode: theme.colorScheme === 'dark',
      background: theme.background.paper,
      fontFamily: theme.fonts.body,
      mainBkg: theme.background.primary,
      ...(theme.mermaid || {}),
    },
  })
  const { svg } = await mermaid.render(id, chart)
  return svg
}

/**
 * Renders a mermaid diagram. Until the client renders the SVG — and if the source is
 * invalid — it falls back to the diagram source in a `CodeBlock`, so server output and
 * no-JS readers still show something useful and hydration stays stable.
 */
export function Mermaid({ chart, diagram }: Readonly<MermaidProps>) {
  const theme = useTheme()
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    toSvg(id, chart, theme)
      .then((rendered) => {
        if (active) setSvg(rendered)
      })
      .catch(() => {
        if (active) setSvg(null)
      })
    return () => {
      active = false
    }
  }, [chart, id, theme])

  if (svg) return <DiagramViewer svg={svg} {...diagram} />
  return <CodeBlock>{chart}</CodeBlock>
}
