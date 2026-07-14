# FormControl

Groups a label, control, and helper text into one accessible field and shares their state through React context. Works standalone or inside a [`Form`](../Form/README.md).

**Architecture:** `FormControl` renders a `View` and provides `FormControlContext`. It auto-generates an `id` via `useId()` (override with the `id` prop) and derives `helperId = ${id}-helper`. Descendant controls read field state through [`useFormControl`](#useformcontrol); `FormLabel` reads the `id` for `htmlFor`; `FormHelperText` registers its presence so the control points `aria-describedby` at it only while it is rendered — no dangling reference, no manual wiring.

---

## Override chain

Field state resolves **explicit prop → FormControl → Form → default**. A prop set on the control always wins; otherwise FormControl fills it; otherwise the surrounding `Form`; otherwise the control's own default.

`error` and `required` are field-only — they are never read from `Form`.

---

## Props

### `id`

`string` — field id. Auto-generated via `useId()` when omitted. Links `FormLabel`'s `htmlFor`, the control, and the helper text id (`${id}-helper`).

### `error`

`boolean` — marks the field invalid. Trickles to the control and to `FormHelperText` (error color + `role="alert"`).

### `disabled`

`boolean` — disables the field. Trickles to the control.

### `required`

`boolean` — marks the field required. Trickles to the `FormLabel` indicator and the control.

### `size`

`keyof Theme['sizes']` — `"sm" | "md" | "lg"`. Trickles to the control. Default resolves to `"md"`.

### `fullWidth`

`boolean` — stretches the root to `width: 100%` and trickles to the control.

### `color`

`keyof Theme['palette']` — accent color. Trickles to the control.

### `textColor`

`keyof Theme['text']` — text color for the field's label, helper, and input content. Trickles to `FormLabel`, `FormHelperText`, and `TextInput` (error helper text keeps the error color).

---

## Styled-system props

All `View` props pass through to the root (space, layout, etc.), except `color`, which is the field accent token described above.

---

## `useFormControl`

Hook consumed by controls (`TextInput`, `Checkbox`, `Radio`) and by `Field`. Merges the control's explicit props with `FormControl` and `Form` context per the override chain and returns the resolved `{ id, error, disabled, required, size, fullWidth, color, 'aria-describedby' }`. Uniform defaults (`size`, the booleans) are applied here; `color` is left for each control to default, since its domain differs (e.g. `Checkbox` adds `"default"`).

---

## Examples

```tsx
<FormControl id="email" required>
  <FormLabel>Email</FormLabel>
  <TextInput variant="outlined" placeholder="me@example.com" />
  <FormHelperText>We'll never share it.</FormHelperText>
</FormControl>

// Error state — error trickles to the input border and the helper text
<FormControl error required fullWidth>
  <FormLabel>Email</FormLabel>
  <TextInput variant="outlined" />
  <FormHelperText>Enter a valid e-mail address.</FormHelperText>
</FormControl>
```
