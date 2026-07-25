# LiveEdit

A preview you write on directly. The markdown document renders exactly like `Preview`, split into
top-level blocks (paragraphs, headings, lists, fenced code, tables, …), and **every block is
`contentEditable`** — you type straight into the styled output, no textarea. While a block is
being typed in, the browser owns its DOM; every input serializes that block's DOM back to
markdown (`rehype-parse` → `rehype-remark` → `remark-stringify`, GFM-aware) and splices it into
`value`, so `onChange` fires live and the component stays fully controlled.

Round-trip guarantees:

- **Untouched blocks keep their exact source** — only the block you edit is (re)serialized, so
  normalization (list markers, emphasis style, spacing) is confined to it.
- Blur or Escape ends the edit and re-splits the document — paragraph breaks typed inside a block
  become their own blocks.
- Typed characters are literal text (WYSIWYG): typing `**bold**` produces escaped literal text,
  it does not create bold. Structure comes from editing the rendered elements or from the other
  editing surfaces.
- Fenced code keeps its language (the preview keeps `language-*` on the `code` element); the
  copy control and other non-content UI are stripped before serializing.
- ` ```mermaid ` blocks are **read-only** — a rendered diagram has no text to edit in place.

Inside a [`Control`](../Control/README.md) the component is driven by context (shares
`value`/`onChange` with `Toolbar`, `Editor`, `Preview`); standalone it is a plain controlled
component.

## Usage

```tsx
import { LiveEdit } from '@soroush.tech/markdown'

<LiveEdit value={source} onChange={setSource} />

// or composed:
<Control value={source} onChange={setSource}>
  <LiveEdit />
</Control>
```

## Props

| Prop          | Type                      | Default                     | Description                                                             |
| ------------- | ------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `value`       | `string`                  | `''`                        | Standalone source value. Ignored inside a `Control`.                    |
| `onChange`    | `(value: string) => void` | —                           | Standalone change handler, called live per input. Ignored in `Control`. |
| `placeholder` | `string`                  | `'Click to start writing…'` | Shown inside the empty document's first block until something is typed. |
| `slotProps`   | `PreviewSlotProps`        | —                           | Per-element prop overrides forwarded to every block's `Preview` render. |

## Theming

Two named styled roots are customizable via `theme.components.MarkdownLiveEdit`:

| Slot    | Element                                                          |
| ------- | ---------------------------------------------------------------- |
| `root`  | The outer container.                                             |
| `block` | Every editable block wrapper (hover/focus outline, placeholder). |

The hover/focus outline reads `theme.border.primary` and `theme.borderWidths.thin`; the block
corner radius reads `theme.radii.sm`; the placeholder reads `theme.text.secondary`. Like
`Preview`, any theme rendering fenced code must supply `theme.syntax`
(`syntaxDark`/`syntaxLight`).
