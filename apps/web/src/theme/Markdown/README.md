# Markdown

A headless, composable markdown **editor + renderer**. The parts share state via context and are
imported directly (barrel `export *` — there is no `Markdown.*` namespace):

```tsx
import { Control, Toolbar, Editor, Preview } from 'src/theme/Markdown'
```

## Parts

| Part                                             | Role                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| [`Control`](./Control/README.md)                 | Headless provider — owns value/selection state + `dispatch`.       |
| [`Toolbar`](./Toolbar/README.md)                 | Formatting buttons, heading/code selects, table picker.            |
| [`Editor`](./Editor/README.md)                   | The source `<textarea>` (Tab-to-indent, selection, caret restore). |
| [`Preview`](./Preview/README.md)                 | Renders a markdown string to design-system primitives.             |
| [`TablePicker`](./Toolbar/TablePicker.README.md) | Hover-grid table-size picker used by the Toolbar.                  |

`Toolbar` and `Editor` must be rendered inside `Control`. `Preview` is a pure renderer and also
works standalone (article / README bodies).

## No view switcher

The theme layer is intentionally headless — it has **no** Edit·Split·Preview switch. The consumer
decides which panes to show and owns the switch state. The default composition (toolbar + split
editor/preview + switcher) lives in [`section/MarkdownEditor`](../../section/MarkdownEditor).

## Shared logic

- `const.ts` — the toolbar action data (types, `TOOLBAR_ACTIONS`, headings, code languages).
- `utils/applyAction.ts` — the pure transform (wrap/toggle/nest, line-prefix toggle/replace,
  block fences, inserts).
- `utils/groupToolbarActions.ts`, `utils/buildTableSnippet.ts` — toolbar grouping and table markup.
- `MarkdownContext.ts` — context + `useMarkdownContext()`.
