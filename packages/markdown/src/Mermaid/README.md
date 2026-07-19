# Mermaid

Renders a fenced ` ```mermaid ` block as a diagram. Used by [`Preview`](../Preview/README.md) for
`mermaid` code blocks, and usable on its own.

`mermaid` is browser-only and heavy, so it is imported **lazily inside an effect** (never at
module scope) — the package stays SSR-safe and the library stays out of the initial bundle.

Diagram colors follow the active design-system theme: a lean set of anchors is mapped from it
(`background` → `theme.background.paper`, `fontFamily` → `theme.fonts.body`,
`mainBkg` → `theme.background.primary`) and mermaid derives the rest, with `darkMode` taken from
`theme.colorScheme`. Two ways to customize:

- **Per theme** — set `theme.mermaid` (typed `MermaidThemeVariables`) to override any variable or
  add ones not anchored here; it wins over the defaults. e.g.
  `createTheme(baseTheme, { mermaid: { primaryColor: '#BB2528', lineColor: '#F8B229' } })`.
- **Per diagram** — a diagram's own `config` frontmatter `themeVariables` overrides for that one
  diagram.

Invalid diagrams **fall back to their source** in a `CodeBlock` (`suppressErrorRendering`), rather
than drawing mermaid's error graphic.

## Props

| Prop      | Type           | Description                                                           |
| --------- | -------------- | --------------------------------------------------------------------- |
| `chart`   | `string`       | The mermaid diagram source (the body of a fence). Required.           |
| `diagram` | `DiagramProps` | Props forwarded to the zoom/pan viewer, e.g. `{ expandable: false }`. |

The rendered SVG is wrapped in [`DiagramViewer`](./DiagramViewer.README.md) for zoom, pan, and
fullscreen.
