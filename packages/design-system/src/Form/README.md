# Form

Renders a `<form>` and provides form-wide field defaults through `FormContext`. It is the **lowest
priority** in the override chain — a [`FormControl`](../FormControl/README.md) or an explicit prop on
a control always wins.

**Architecture:** `Form` is purely presentational + context. It holds no form state, runs no
validation, and is not tied to any form library — [`Field`](../Field/README.md) is the only piece
that bridges to TanStack Form. Pass `onSubmit` straight through; wire it to your form library's submit
handler (e.g. `form.handleSubmit()`).

---

## Props

### `onSubmit`

`(event: FormEvent<HTMLFormElement>) => void` — native submit handler. Call `event.preventDefault()`
and delegate to your form library.

### `size`

`keyof Theme['sizes']` — `"sm" | "md" | "lg"`. Default control size for every field.

### `color`

`keyof Theme['palette']` — default accent color for every field.

### `textColor`

`keyof Theme['text']` — default text color for every field's label, helper, and input content.

### `disabled`

`boolean` — disables every field.

### `fullWidth`

`boolean` — stretches every field to fill its container.

### `id` / `className` / `noValidate` / `data-testid`

Forwarded to the `<form>` element. Set `noValidate` so field-level validation owns the UX instead of
the browser's native popups.

---

## Examples

```tsx
const form = useMyForm() // TanStack Form instance

<Form size="md" color="primary" fullWidth noValidate
  onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
  <Field form={form} name="email" label="Email">
    {(field) => (
      <TextInput
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        inputProps={{ onBlur: field.handleBlur }}
      />
    )}
  </Field>
</Form>
```
