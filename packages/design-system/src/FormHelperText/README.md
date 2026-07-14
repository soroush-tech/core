# FormHelperText

Helper or error text for a field, built on [`Typography`](../Typography/README.md) and rendered as a `<p>`. Reads its `id` and error state from [`FormControl`](../FormControl/README.md) context and registers its presence so the control points `aria-describedby` at it only while it is rendered.

**Architecture:** `FormHelperText` renders `Typography as="p"`. `id` resolves to the explicit prop, else the FormControl `helperId` (`${id}-helper`). When `error` is set (or inherited from FormControl), it renders in `color="error"` and sets `role="alert"` so changes are announced. On mount it calls the FormControl's stable `setHasHelperText(true)` and clears it on unmount — that flag drives `aria-describedby` on the control, so a reference is only present when the text is.

---

## Props

### `children`

`ReactNode` — the helper or error text.

### `error`

`boolean` — renders in the error color and announces via `role="alert"`. Falls back to the FormControl `error` value. Default: `false`.

### `id`

`string` — overrides the helper id. Falls back to the FormControl `helperId`.

### `role`

`string` — forwarded when **not** in error. In the error state, `role="alert"` is applied automatically.

---

## Styled-system props

All `Typography` props pass through. Defaults to `variant="caption"` and `color="secondary"` (or `"error"` in the error state). When not in error and `color` is not set, it inherits `textColor` from `FormControl`/`Form` context (`theme.text`); the error state always wins.

---

## Examples

```tsx
// Standalone helper
<FormHelperText>We'll never share it.</FormHelperText>

// Inside FormControl — id and error state come from context
<FormControl id="email" error>
  <FormHelperText>Enter a valid e-mail address.</FormHelperText>
</FormControl>

// Explicit error
<FormHelperText error>Enter a valid e-mail address.</FormHelperText>
```
