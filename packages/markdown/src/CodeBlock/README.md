# CodeBlock

A fenced-code surface: a horizontally scrollable, terminal-styled block with a copy-to-clipboard
button that stays pinned to the top-right while the block is in view. Syntax highlighting is not
applied here — it comes from the caller (e.g. `Markdown.Preview` runs `rehype-highlight`, which
emits `hljs-*` classes the surface themes to `theme.syntax`).

## Props

| Prop       | Type        | Description                                                     |
| ---------- | ----------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | The code content (typically a `<code>` element).                |
| …`rest`    | `ViewProps` | Spacing/layout passthrough to the wrapper (`my`, `p`, `bg`, …). |

```tsx
<CodeBlock my={3}>
  <code>const answer = 42</code>
</CodeBlock>
```

## Behaviour

- The copy button reads the surface's `textContent`, trims trailing newlines, and writes it to the
  clipboard (via `useCopyToClipboard`), briefly swapping to a checkmark to confirm.
- The surface owns its horizontal scroll, so wide code never stretches the page.

## Theming

`theme.syntax` (typed `ThemeSyntax`) is not one of design-system's own scales — this package
augments `@soroush.tech/design-system/theme` with it (see `src/index.ts`), since it exists solely
for this component's highlight.js token mapping and its `font` (the code surface's font family,
independent of `theme.fonts.mono`). It's required wherever `CodeBlock` renders, so merge one of the
shipped presets into your theme:

```ts
import { createTheme } from '@soroush.tech/design-system/utils'
import { baseTheme } from '@soroush.tech/design-system/theme'
import { syntaxDark } from '@soroush.tech/markdown/CodeBlock'

const theme = createTheme(baseTheme, { syntax: syntaxDark })
```

`syntaxLight` is also exported for a light-mode theme. Both are JetBrains "Islands" scheme
matches; supply your own `ThemeSyntax` object instead if you want different token colors or font.
