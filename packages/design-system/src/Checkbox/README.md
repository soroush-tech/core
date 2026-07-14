# Checkbox

A binary toggle control. Supports controlled and uncontrolled usage, six semantic color palettes, two sizes, indeterminate state, and custom icons.

**Architecture:** the root element is a `<label>` wrapping a visually-hidden `<input type="checkbox">`, an icon span, and optional label text. Clicking anywhere on the root (icon or text) toggles the checkbox. The native input handles all browser behaviour, form submission, and accessibility.

---

## Props

### `checked`

`boolean` — controlled checked state. Must be paired with `onChange`.

---

### `defaultChecked`

`boolean` — initial checked state for uncontrolled usage. Ignored when `checked` is provided.

Default: `false`.

---

### `disabled`

`boolean` — disables the checkbox. Applies `opacity: 0.5` and `cursor: not-allowed`.

Default: `false`.

---

### `color`

Stroke/fill color of the checkbox icon.

| Token         | Dark source                                    | Light source                                 |
| ------------- | ---------------------------------------------- | -------------------------------------------- |
| `"default"`   | `theme.text.secondary` (`kineticSurface[400]`) | `theme.text.secondary` (`kineticGreen[800]`) |
| `"primary"`   | `kineticGreen[500]`                            | `kineticGreen[600]`                          |
| `"secondary"` | `cyberCyan[500]`                               | `cyberCyan[700]`                             |
| `"success"`   | `kineticGreen[700]`                            | `kineticGreen[700]`                          |
| `"error"`     | `neonRed[500]`                                 | `neonRed[700]`                               |
| `"info"`      | `cyberCyan[500]`                               | `cyberCyan[800]`                             |
| `"warning"`   | `solarAmber[400]`                              | `solarAmber[500]`                            |

Default: `"default"`.

---

### `size`

| Value      | Icon size |
| ---------- | --------- |
| `"small"`  | 16px      |
| `"medium"` | 20px      |

Default: `"medium"`.

---

### `fullWidth`

`boolean` — stretches the root to `width: 100%` (and switches it to `display: flex`).

Default: `false`.

---

### `indeterminate`

`boolean` — displays the indeterminate state (horizontal dash icon). Takes visual priority over `checked`. Also sets the native `input.indeterminate` property (for form APIs) and a `data-indeterminate` attribute (for CSS targeting).

Default: `false`.

---

### `icon`

`ReactNode` — custom icon for the **unchecked** state. Defaults to an outlined square SVG.

---

### `checkedIcon`

`ReactNode` — custom icon for the **checked** state. Defaults to a filled square SVG with a white checkmark. Not used for the `indeterminate` state (which always uses the default dash icon).

---

### `onChange`

`(event: ChangeEvent<HTMLInputElement>) => void` — called when the user toggles the checkbox.

---

### `id`

`string` — forwarded to the underlying `<input>` for external label association (`<label htmlFor="...">`) and form targeting.

---

### `required`

`boolean` — marks the field as required in a form.

---

### `name` / `value`

Standard form field attributes forwarded to the underlying `<input>`.

---

### `children`

`ReactNode` — label text rendered next to the checkbox icon, wrapped in a `<span>`.

---

## Styled-system props

### Space — `theme.space` (margin only)

| Prop                              | Shorthand for  |
| --------------------------------- | -------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides |

---

## Focus

When the hidden `<input>` receives keyboard focus, a `2px solid currentColor` outline appears on the icon wrapper via the CSS `:has(input:focus-visible)` selector. No JavaScript state is needed.

---

## Examples

```tsx
// Uncontrolled
<Checkbox>Accept terms</Checkbox>

// Controlled
<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
  I agree
</Checkbox>

// Indeterminate (select-all pattern)
<Checkbox indeterminate={someChecked && !allChecked} checked={allChecked} onChange={handleAll} />

// Colors and sizes
<Checkbox color="primary" size="small">Small primary</Checkbox>
<Checkbox color="error">Error state</Checkbox>

// Disabled
<Checkbox disabled>Cannot change</Checkbox>
<Checkbox disabled checked onChange={() => {}}>Locked on</Checkbox>

// Custom icons
<Checkbox icon={<StarOutline />} checkedIcon={<StarFilled />}>Favourite</Checkbox>

// Form usage
<Checkbox id="terms" name="terms" required>Accept terms</Checkbox>
```
