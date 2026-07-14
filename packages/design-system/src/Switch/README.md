# Switch

A sliding toggle control. Supports controlled and uncontrolled usage, six semantic color palettes, two sizes, four visual variants, and custom thumb icons.

**Architecture:** the root element is a `<label>` wrapping a visually-hidden `<input type="checkbox" role="switch">`, a pill-shaped track, and optional label text. Clicking anywhere on the root toggles the switch. All state transitions are driven by CSS — no JavaScript animation.

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

`boolean` — disables the switch. Applies `opacity: 0.5` and `cursor: not-allowed`.

Default: `false`.

---

### `color`

Track color in the checked state.

| Token         | Dark source                                    | Light source                                 |
| ------------- | ---------------------------------------------- | -------------------------------------------- |
| `"default"`   | `theme.text.secondary` (`kineticSurface[400]`) | `theme.text.secondary` (`kineticGreen[800]`) |
| `"primary"`   | `kineticGreen[500]`                            | `kineticGreen[600]`                          |
| `"secondary"` | `cyberCyan[500]`                               | `cyberCyan[700]`                             |
| `"success"`   | `kineticGreen[700]`                            | `kineticGreen[700]`                          |
| `"error"`     | `neonRed[500]`                                 | `neonRed[700]`                               |
| `"info"`      | `cyberCyan[500]`                               | `cyberCyan[800]`                             |
| `"warning"`   | `solarAmber[400]`                              | `solarAmber[500]`                            |

In the unchecked state, the track uses `theme.background[bg]` when `bg` is set, or `theme.text.disabled` by default.

Default: `"default"`.

---

### `bg`

`keyof Theme['background']` — background color of the track in the **unchecked** state.

Uses `theme.background` tokens (`default`, `paper`, `elevated`, `overlay`). When not set, the track falls back to `theme.text.disabled`.

The checked-state color is always controlled by the `color` prop.

---

### `variant`

Placement model for the thumb.

| Value       | Style notes                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `"outside"` | MUI-inspired; thumb overflows the track vertically; 4px root padding; 0.15s. |
| `"inside"`  | iOS-inspired; thumb contained within the track; no root padding; 0.3s.       |

The `size` prop works for both variants. Use `marked` to add ✓/✕ indicators.

Default: `"outside"`.

---

### `size`

Applies to both variants. Follows `keyof Theme['sizes']` — the same token vocabulary as `Button` and `TextInput`.

| Value  | `outside` track | `outside` thumb | `inside` track | `inside` thumb |
| ------ | --------------- | --------------- | -------------- | -------------- |
| `"sm"` | 34 × 14 px      | 20 px           | 36 × 20 px     | 16 px          |
| `"md"` | 44 × 18 px      | 24 px           | 46 × 26 px     | 22 px          |
| `"lg"` | 54 × 22 px      | 28 px           | 56 × 32 px     | 28 px          |

Default: `"md"`.

---

### `marked`

`boolean` — shows ✓/✕ state indicators.

- `variant="outside"` — a check mark SVG appears inside the thumb when checked; an ✕ SVG when unchecked. Custom `icon`/`checkedIcon` override the defaults.
- `variant="inside"` — check and ✕ SVG icons are rendered as DOM elements in the track; no thumb icons are injected.

Default: `false`.

---

### `edge`

Applies a negative margin (`-8px`) to counteract the root's horizontal padding on the given side. Use when the switch sits flush against the start or end edge of a layout.

| Value     | Effect               |
| --------- | -------------------- |
| `"start"` | `margin-left: -8px`  |
| `"end"`   | `margin-right: -8px` |
| `false`   | No edge adjustment   |

Default: `false`.

---

### `icon`

`ReactNode` — custom icon rendered inside the thumb for the **unchecked** state. No default icon is shown without this prop.

---

### `checkedIcon`

`ReactNode` — custom icon rendered inside the thumb for the **checked** state. No default icon is shown without this prop.

---

### `onChange`

`(event: ChangeEvent<HTMLInputElement>) => void` — called when the user toggles the switch.

---

### `id`

`string` — forwarded to the underlying `<input>` for external label association and form targeting.

---

### `required`

`boolean` — marks the field as required in a form.

---

### `children`

`ReactNode` — label text rendered next to the track, wrapped in a `<span>`.

---

### `className`

`string` — applied to the root `<label>` element for external styling overrides.

---

### `disableRipple`

`boolean` — accepted for API parity. The design system does not implement ripple, so this prop has no effect.

---

## Styled-system props

### Space — `theme.space` (margin only)

| Prop                              | Shorthand for  |
| --------------------------------- | -------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides |

---

## Focus

When the hidden `<input>` receives keyboard focus, a `2px solid currentColor` outline appears on the track via the CSS `:has(input:focus-visible)` selector.

---

## Accessibility

The hidden input carries `role="switch"` for screen reader semantics. `aria-checked` is derived automatically from the native checkbox state.

---

## Examples

```tsx
// Uncontrolled
<Switch>Enable dark mode</Switch>

// Controlled
<Switch checked={isOn} onChange={(e) => setIsOn(e.target.checked)}>
  Notifications
</Switch>

// Colors and sizes
<Switch color="primary" size="sm" />
<Switch color="error" size="lg" />

// Variants
<Switch variant="outside" color="primary" />
<Switch variant="inside" color="primary" />

// Marked — SVG icons in thumb (outside) or CSS marks in track (inside)
<Switch variant="outside" marked color="primary" />
<Switch variant="inside" marked color="primary" />

// Disabled
<Switch disabled>Cannot change</Switch>
<Switch disabled checked onChange={() => {}}>Locked on</Switch>

// Custom thumb icons
<Switch
  icon={<span>🌙</span>}
  checkedIcon={<span>☀️</span>}
  color="primary"
/>

// Edge — flush with layout boundary
<Switch edge="start" color="primary">Flush start</Switch>

// Form usage
<Switch id="notifications" required>Accept notifications</Switch>
```
