# Radio

A single-selection control for use within a group. Supports controlled checked state, six semantic color palettes, two sizes, and custom icons.

**Architecture:** the root element is a `<label>` wrapping a visually-hidden `<input type="radio">`, an icon span, and optional label text. Clicking anywhere on the root (icon or text) selects the radio. The native input handles all browser behaviour, form submission, and accessibility. Group exclusivity is enforced by the browser via a shared `name` prop.

---

## Props

### `checked`

`boolean` — controlled checked state. Must be paired with `onChange`.

---

### `disabled`

`boolean` — disables the radio. Applies `opacity: 0.5` and `cursor: not-allowed`.

Default: `false`.

---

### `color`

Stroke/fill color of the radio icon.

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

### `icon`

`ReactNode` — custom icon for the **unchecked** state. Defaults to an outlined circle SVG.

---

### `checkedIcon`

`ReactNode` — custom icon for the **checked** state. Defaults to a filled circle SVG with a white inner dot.

---

### `onChange`

`(event: ChangeEvent<HTMLInputElement>) => void` — called when the user selects the radio.

---

### `id`

`string` — forwarded to the underlying `<input>` for external label association (`<label htmlFor="...">`) and form targeting.

---

### `required`

`boolean` — marks the field as required in a form.

---

### `name`

`string` — radio group identifier. All radios sharing the same `name` are mutually exclusive in the browser. Required for group behaviour.

---

### `value`

`string | number | readonly string[]` — value submitted with the form when this radio is selected.

---

### `inputProps`

`InputHTMLAttributes<HTMLInputElement>` — extra props spread onto the underlying `<input>` before the explicit top-level props. Use for `aria-label`, `aria-describedby`, `tabIndex`, `data-*`, etc. Explicit top-level props (`checked`, `onChange`, `name`, etc.) always take priority.

---

### `children`

`ReactNode` — label text rendered next to the radio icon, wrapped in a `<span>`.

---

## Styled-system props

### Space — `theme.space` (margin only)

| Prop                              | Shorthand for  |
| --------------------------------- | -------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides |

---

## Focus

When the hidden `<input>` receives keyboard focus, a `2px solid currentColor` outline appears on the icon wrapper via the CSS `:has(input:focus-visible)` selector. The outline uses `border-radius: 50%` to follow the circular icon shape.

---

## Examples

```tsx
// Controlled group
const [selected, setSelected] = useState('a')

<Radio name="size" value="a" checked={selected === 'a'} onChange={() => setSelected('a')}>Small</Radio>
<Radio name="size" value="b" checked={selected === 'b'} onChange={() => setSelected('b')}>Medium</Radio>
<Radio name="size" value="c" checked={selected === 'c'} onChange={() => setSelected('c')}>Large</Radio>

// Colors and sizes
<Radio color="primary" size="small">Small primary</Radio>
<Radio color="error">Error state</Radio>

// Disabled
<Radio disabled>Cannot change</Radio>
<Radio disabled checked onChange={() => {}}>Locked on</Radio>

// Custom icons
<Radio icon={<CircleOutline />} checkedIcon={<CircleFilled />}>Favourite</Radio>

// Form usage
<Radio id="terms" name="terms" value="yes" required>Accept terms</Radio>

// Extra input attributes via inputProps
<Radio inputProps={{ 'aria-label': 'Option A', tabIndex: 0 }} />
```
