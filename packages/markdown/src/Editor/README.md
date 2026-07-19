# Editor

The source `<textarea>` of the `Markdown` compound.

- **Inside a `Control`** (the usual case) it is driven by context, so the `Toolbar` can act on the
  same value/selection.
- **Standalone** (no `Control`) it is a plain controlled field — pass `value` / `onChange`
  directly. Without a toolbar it's essentially a `TextInput` with Tab-to-indent, handy as a form
  field.

## Behaviour

- Tracks the textarea selection (so `Toolbar` actions apply at the caret) and restores the
  caret/selection after a dispatched action.
- **Tab** inserts a real tab (U+0009): a single tab at the caret, or one per line for a multi-line
  selection — it does not move focus.
- **Escape** or **Ctrl/Cmd+Shift+M** releases focus from the field (the normal Tab behaviour).
- A one-line hint of these shortcuts renders under the field by default — set `showShortcutHint`
  to `false` to hide it.

## Props

| Prop                              | Type                      | Default     | Description                                                   |
| --------------------------------- | ------------------------- | ----------- | ------------------------------------------------------------- |
| `value`                           | `string`                  | —           | Standalone source (ignored inside a `Control`).               |
| `onChange`                        | `(value: string) => void` | —           | Standalone change handler (ignored inside a `Control`).       |
| `name`                            | `string`                  | —           | Native textarea `name` for `<form>` / FormData submission.    |
| `error` / `required` / `disabled` | `boolean`                 | —           | Form-field state — falls back to the enclosing `FormControl`. |
| `id`                              | `string`                  | —           | Label association — falls back to `FormControl`.              |
| `placeholder`                     | `string`                  | —           | Shown while the source is empty.                              |
| `minRows`                         | `number`                  | `16`        | Minimum visible rows of the auto-growing textarea.            |
| `showShortcutHint`                | `boolean`                 | `true`      | Shows the one-line Tab / focus-release shortcut hint.         |
| `variant`                         | `TextInputVariant`        | `'default'` | Forwarded to `TextInput`.                                     |
| `color`                           | `TextInputColor`          | `'primary'` | Focus/active border colour — forwarded.                       |
| `textColor`                       | `TextInputTextColor`      | `'initial'` | Text colour of the typed source — forwarded.                  |
| `size`                            | `TextInputSize`           | `'md'`      | Padding/font-size density — forwarded.                        |

```tsx
<Control value={value} onChange={setValue}>
  <Editor placeholder="Write…" variant="outlined" />
</Control>
```
