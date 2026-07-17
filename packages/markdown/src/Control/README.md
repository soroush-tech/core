# Control

The headless root of the `Markdown` compound. It renders **no UI of its own** — it owns the shared
value/selection state and exposes it (plus a `dispatch` for toolbar actions) via context to the
nested parts (`Toolbar`, `Editor`, `Preview`). Controlled: the consumer holds the `value`.

There is no built-in view switcher; the consumer arranges the parts and decides which panes to show
(see `section/MarkdownEditor`).

## Props

| Prop       | Type                      | Description                                          |
| ---------- | ------------------------- | ---------------------------------------------------- |
| `value`    | `string`                  | Current markdown source (controlled).                |
| `onChange` | `(value: string) => void` | Called on typing or a toolbar action.                |
| `children` | `ReactNode`               | The composed parts — `Toolbar`, `Editor`, `Preview`. |

## Context

`useMarkdownContext()` (throws if used outside `Control`) exposes `{ value, onChange, dispatch,
rememberSelection, queueSelection, takeQueuedSelection }` for building custom compositions.

```tsx
<Control value={value} onChange={setValue}>
  <Toolbar />
  <Editor />
  <Preview>{value}</Preview>
</Control>
```
