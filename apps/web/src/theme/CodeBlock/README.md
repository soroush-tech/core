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
