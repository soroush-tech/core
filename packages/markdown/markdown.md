# Markdown package conventions

`@soroush.tech/markdown` is a companion component library to
[`@soroush.tech/design-system`](../design-system). **Its components follow the design system's
conventions verbatim** — read [`../design-system/design-system.md`](../design-system/design-system.md)
before working here. That doc is the law for: per-component folder structure, prop types derived
from `Theme` (never manual unions), `styled(...)` naming + `system()` wiring, `shouldForwardProp`,
the Storybook argType rules (`controls.include` whitelist, an `argType` per included prop,
`table.category`, no top-level `name`), no hardcoded hex in components (only in test/story
fixtures), and the four-plus-index files every component ships.

It also follows [`../packages.md`](../packages.md): the publishable-package layout
(`publishConfig` dist-swap, tsdown, `LICENSE`, release notes), **100% test coverage**, and the
Codecov/CI registration.

This file only records what is **specific** to this package.

## Components

Each lives in its own folder with the files design-system.md requires
(`index.ts`, `Component.tsx`, `README.md`, `Component.stories.tsx`, `Component.test.tsx`); a
sub-component adds `SubName.README.md` + `SubName.stories.tsx` next to its sibling (as
`Toolbar/TablePicker` and `Mermaid/DiagramViewer` do):

- **`Control`, `Toolbar` (+ `TablePicker`), `Editor`, `Preview`** — the headless markdown
  editor/renderer.
- **`CodeBlock`** — the fenced-code surface (moved here from the design system; `Preview`/`Mermaid`
  are its only consumers).
- **`Mermaid` (+ `DiagramViewer`)** — renders ` ```mermaid ` blocks as themed, zoomable diagrams.

## Markdown-specifics

- **Theme slots via augmentation.** Unlike an in-repo design-system component, this package is a
  _consumer_ of the design system, so it registers its `theme.components` slots (`MarkdownEditor`,
  `MarkdownPreview`, `MarkdownToolbar`, `CodeBlock`) by augmenting `@emotion/react` in
  `src/index.ts` — the consumer recipe from design-system `docs/theming.md`. Its own
  `themeComponents.spec.tsx` locks that wiring (design-system's spec covers only design-system
  components).
- **No `audit:styled`.** The styled-audit tooling is design-system-only. Markdown's named `styled`
  roots (`MarkdownEditor`, `MarkdownPreview`, `MarkdownToolbar`, `CodeBlock`) are instead locked by
  `themeComponents.spec.tsx`.
- **Design-system tokens only.** Components read tokens from the active design-system theme. e.g.
  `Mermaid` anchors mermaid's palette to `theme.background`/`theme.fonts` (mermaid derives the
  rest) with `darkMode` from `theme.colorScheme`, and lets consumers override any variable via the
  augmented `theme.mermaid` key (typed `MermaidThemeVariables`). Hex literals appear only in
  test/story fixtures.
- **Browser-only libraries are lazy-loaded.** `mermaid` is imported inside an effect, never at
  module scope, so the package stays SSR-safe and it lands in a lazy chunk. Invalid diagrams fall
  back to their source (`suppressErrorRendering`).
