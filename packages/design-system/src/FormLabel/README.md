# FormLabel

A field label built on [`Typography`](../Typography/README.md), rendered as a `<label>`. Reads the control `id` and `required` flag from [`FormControl`](../FormControl/README.md) context so association and the required indicator wire automatically.

**Architecture:** `FormLabel` renders `Typography as="label"`. `htmlFor` resolves to the explicit prop, else the FormControl `id`. The `required` indicator (` *`) is appended as text (so it is part of the accessible name) when `required` is set, falling back to the FormControl `required` value. Every Typography prop passes through, so callers restyle freely while keeping the wiring.

---

## Props

### `children`

`ReactNode` — the label text.

### `required`

`boolean` — appends a ` *` indicator. Falls back to the FormControl `required` value. Default: `false`.

### `htmlFor`

`string` — target control id. Falls back to the FormControl `id`.

---

## Styled-system props

All `Typography` props pass through (`variant`, `color`, `textTransform`, `letterSpacing`, space props, etc.). Defaults to `variant="body2"`. When `color` is not set, the label inherits `textColor` from `FormControl`/`Form` context (`theme.text`).

---

## Examples

```tsx
// Standalone
<FormLabel htmlFor="email">Email</FormLabel>

// Inside FormControl — htmlFor and required come from context
<FormControl id="email" required>
  <FormLabel>Email</FormLabel>
</FormControl>

// Restyled
<FormLabel variant="caption" color="primary" textTransform="uppercase" letterSpacing="widest">
  Email
</FormLabel>
```
