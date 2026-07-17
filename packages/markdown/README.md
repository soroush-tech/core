# @soroush.tech/markdown

[![npm version](https://img.shields.io/npm/v/@soroush.tech/markdown.svg)](https://www.npmjs.com/package/@soroush.tech/markdown)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/markdown.svg)](https://www.npmjs.com/package/@soroush.tech/markdown)
[![coverage](https://codecov.io/gh/soroush-tech/core/branch/main/graph/badge.svg?flag=markdown)](https://app.codecov.io/gh/soroush-tech/core?flags%5B0%5D=markdown)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/markdown.svg)](https://www.npmjs.com/package/@soroush.tech/markdown)
[![types included](https://img.shields.io/npm/types/@soroush.tech/markdown.svg)](https://www.npmjs.com/package/@soroush.tech/markdown)
[![license](https://img.shields.io/npm/l/@soroush.tech/markdown.svg)](./LICENSE)

A headless, composable markdown **editor + renderer** for [@soroush.tech/design-system](https://www.npmjs.com/package/@soroush.tech/design-system). The parts share state via context and are imported directly from the barrel (there is no `Markdown.*` namespace):

```tsx
import { Control, Toolbar, Editor, Preview } from '@soroush.tech/markdown'
```

## Install

```sh
npm i @soroush.tech/markdown
```

`@soroush.tech/design-system`, `react`, `react-dom`, `@emotion/react`, and `@emotion/styled` are peer dependencies. The renderer builds on `react-markdown`, `remark-gfm`, and `rehype-highlight`, which ship as dependencies.

## Parts

| Part                                                 | Role                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| [`Control`](./src/Control/README.md)                 | Headless provider — owns value/selection state + `dispatch`.       |
| [`Toolbar`](./src/Toolbar/README.md)                 | Formatting buttons, heading/code selects, table picker.            |
| [`Editor`](./src/Editor/README.md)                   | The source `<textarea>` (Tab-to-indent, selection, caret restore). |
| [`Preview`](./src/Preview/README.md)                 | Renders a markdown string to design-system primitives.             |
| [`TablePicker`](./src/Toolbar/TablePicker.README.md) | Hover-grid table-size picker used by the Toolbar.                  |

`Toolbar` and `Editor` must be rendered inside `Control`. `Preview` is a pure renderer and also works standalone (article / README bodies).

## No view switcher

The package is intentionally headless — it has **no** Edit·Split·Preview switch. The consumer decides which panes to show and owns the switch state.

## Theming

The three roots register `theme.components` slots — `MarkdownEditor`, `MarkdownPreview`, and `MarkdownToolbar` — by augmenting `@emotion/react`. Importing this package pulls the augmentation in, so `theme.components.MarkdownPreview = { styleOverrides: { root: … } }` type-checks and applies through design-system's `createTheme` / `ThemeProvider`.

## Shared logic

- `const.ts` — the toolbar action data (types, `TOOLBAR_ACTIONS`, headings, code languages).
- `utils/applyAction.ts` — the pure transform (wrap/toggle/nest, line-prefix toggle/replace, block fences, inserts).
- `utils/groupToolbarActions.ts`, `utils/buildTableSnippet.ts` — toolbar grouping and table markup.
- `MarkdownContext.ts` — context + `useMarkdownContext()`.
