# TextInput

A theme-aware text input primitive. Supports controlled and uncontrolled usage, multiline (textarea), error and disabled states, and all standard form attributes.

**Architecture:** `TextInputRoot` is a styled `<div>` that owns the visible border and focus ring. The native `<input>` (or `<textarea>`) sits inside it with a transparent background, so the root border appears as the field border. This makes it easy to add prefix/suffix adornments later.

---

## Props

### `color`

Focus/active border color — resolves to `theme.palette[color].main`.

| Token         | Dark source         | Light source        |
| ------------- | ------------------- | ------------------- |
| `"primary"`   | `kineticGreen[500]` | `kineticGreen[600]` |
| `"secondary"` | `cyberCyan[500]`    | `cyberCyan[700]`    |
| `"success"`   | `kineticGreen[700]` | `kineticGreen[700]` |
| `"error"`     | `neonRed[500]`      | `neonRed[700]`      |
| `"info"`      | `cyberCyan[500]`    | `cyberCyan[800]`    |
| `"warning"`   | `solarAmber[400]`   | `solarAmber[500]`   |

Default: `"primary"`.

---

### `textColor`

Text color of the typed value — resolves against `theme.text` (`primary`, `secondary`, `error`, …). Inherited from `Form`/`FormControl` context when not set.

Default: `"primary"`.

---

### `disabled`

`boolean` — disables the input. Applies `opacity: 0.5`, `cursor: not-allowed`, and `pointer-events: none` on the root.

Default: `false`.

---

### `error`

`boolean` — marks the field as invalid. Border color switches to `theme.palette.error.main` and stays that color even on focus.

Default: `false`.

---

### `fullWidth`

`boolean` — stretches the root to `width: 100%`.

Default: `false`.

---

### `multiline`

`boolean` — renders a `<textarea>` instead of `<input>`. Use `rows` to set the visible height.

Default: `false`.

---

### `rows`

`number | string` — number of visible rows when `multiline`. Forwarded directly to the native `<textarea>`.

---

### `maxRows` / `minRows`

`number | string` — accepted for API compatibility. These have no native effect; a `TextareaAutosize` component is needed for auto-growing behaviour.

---

### `type`

`string` — HTML5 input type (`text`, `email`, `password`, `number`, `search`, `url`, etc.). Ignored when `multiline`.

Default: `"text"`.

---

### `value`

`string | number | readonly string[]` — controlled value. Must be paired with `onChange`.

---

### `onChange`

`ChangeEventHandler<HTMLInputElement>` — called when the user changes the value.

---

### `placeholder`

`string` — short hint displayed before the user enters a value.

---

### `id` / `name` / `required` / `readOnly` / `autoComplete` / `autoFocus`

Standard form attributes forwarded to the native element.

---

### `inputProps`

`InputHTMLAttributes & TextareaHTMLAttributes` — extra props spread onto the native element before explicit top-level props. Use for `aria-label`, `aria-describedby`, `tabIndex`, `data-*`, etc. Explicit top-level props always take priority.

---

### `classes`

`{ root?: string; input?: string }` — class names merged into the root wrapper and native element respectively. Merged with `className` on the root.

---

## Styled-system props

### Space — `theme.space` (margin only)

| Prop                              | Shorthand for  |
| --------------------------------- | -------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides |

---

## Focus

The root uses `:focus-within` to detect keyboard focus on the native element and switches `border-color` to `theme.palette[color].main`. No JavaScript state is needed.

---

## Examples

```tsx
// Uncontrolled
<TextInput placeholder="Email address" type="email" />

// Controlled
<TextInput value={email} onChange={(e) => setEmail(e.target.value)} />

// Error
<TextInput error placeholder="Invalid email" />

// Full width
<TextInput fullWidth placeholder="Search…" type="search" />

// Multiline
<TextInput multiline rows={4} placeholder="Write a message…" fullWidth />

// Disabled
<TextInput disabled value="Cannot edit" />

// Custom aria via inputProps
<TextInput inputProps={{ 'aria-label': 'Email address', 'aria-describedby': 'email-hint' }} />

// Custom classes
<TextInput classes={{ root: 'my-field', input: 'my-native-input' }} />
```
