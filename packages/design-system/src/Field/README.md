# Field

The single bridge between the design-system form layer and **TanStack Form**. It wraps `form.Field`,
derives the error-display flag, and composes [`FormControl`](../FormControl/README.md),
[`FormLabel`](../FormLabel/README.md), and [`FormHelperText`](../FormHelperText/README.md) so id /
`htmlFor` / `aria-describedby` wiring is automatic.

Everything below `Field` is form-library-agnostic — `Field` is the only component that imports
TanStack types.

**Type safety:** `Field` is generic over the form instance, so `name` is checked against the form's
value schema (`DeepKeys<TFormData>`). The generics are inferred from the `form` prop — callers never
spell them out. A misspelled `name` is a compile error.

**Error UX:** the error message is shown only once the field is touched **or** after a submit
attempt — never on initial render — and only the first error is displayed. The flag is
`(field.state.meta.isTouched || form.state.isSubmitted) && Boolean(message)`. When set, the error
message replaces `helperText` and renders through `FormHelperText` (error color + `role="alert"`).

---

## Props

### `form`

The TanStack Form instance (from `useForm`). Drives `name` typing and the submit/touched state.

### `name`

`DeepKeys<TFormData>` — type-safe field name.

### `label`

`ReactNode` — optional. Rendered as a `FormLabel` above the control.

### `helperText`

`ReactNode` — optional. Shown below the control while the field is valid; replaced by the error
message while invalid.

### `required` / `size` / `fullWidth`

Forwarded into the `FormControl` context so the control and label pick them up.

### `children`

A single control element, e.g. `<TextInput />`. Field clones it and injects the binding from the
TanStack field — `name`, `value`, `onChange` (mapped from the change event's value), and
`inputProps.onBlur` — so the call site stays declarative and the control itself never imports the
form library. This targets the design system's controlled-input contract (TextInput family); the
control's other props (`variant`, `placeholder`, …) pass through untouched.

---

## Example

```tsx
<Field form={form} name="email" label="Email" helperText="We'll never share it" required>
  <TextInput variant="underline" placeholder="me@example.com" />
</Field>
```

`value` / `onChange` / `name` / `onBlur` are injected — you only declare the presentational props.

No Storybook stories: `Field` requires a live TanStack Form instance, so it is covered by unit tests
instead (`Field.test.tsx`).
