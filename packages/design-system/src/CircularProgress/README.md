# CircularProgress

Renders a circular loading indicator. Supports `indeterminate` (looping) and `determinate` (value-driven) variants. The stroke color is set via CSS `currentColor`; the `color` prop resolves to `theme.palette[color].main`.

**Architecture:** the root element is a `<span>` (not `<svg>`). This avoids a TypeScript incompatibility between `SVGAttributes.height` and `LayoutProps.height`. The internal `<svg>` fills the span via `width/height="100%"` and uses a fixed `viewBox="0 0 44 44"` coordinate system — the `size` prop scales the outer span via CSS `width`/`height`.

---

## Props

### `variant`

| Value             | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `"indeterminate"` | Continuous looping animation — use when progress is unknown.    |
| `"determinate"`   | Static arc driven by `value` — use when progress is measurable. |

Default: `"indeterminate"`.

---

### `color`

Resolves to `theme.palette[color].main`. `"inherit"` forwards `currentColor` from the parent — the correct choice inside `Button`'s `loadingIndicator`.

| Token         | Dark source         | Light source        |
| ------------- | ------------------- | ------------------- |
| `"primary"`   | `kineticGreen[500]` | `kineticGreen[600]` |
| `"secondary"` | `cyberCyan[500]`    | `cyberCyan[700]`    |
| `"success"`   | `kineticGreen[700]` | `kineticGreen[700]` |
| `"error"`     | `neonRed[500]`      | `neonRed[700]`      |
| `"info"`      | `cyberCyan[500]`    | `cyberCyan[800]`    |
| `"warning"`   | `solarAmber[400]`   | `solarAmber[500]`   |
| `"inherit"`   | CSS keyword         | CSS keyword         |

Default: `"primary"`.

---

### `size`

Width and height of the root span. Number → appended as `px`; string → used as-is (e.g. `'3rem'`).

Default: `40`.

---

### `thickness`

SVG stroke width in viewBox user units. Scales proportionally with `size`.

Default: `3.6`.

---

### `value` / `min` / `max`

Used by the `"determinate"` variant. `value` is clamped to `[min, max]` via `@soroush.tech/design-system/utils/clamp` before rendering.

| Prop    | Default                     |
| ------- | --------------------------- |
| `value` | `min` (i.e. 0) when omitted |
| `min`   | `0`                         |
| `max`   | `100`                       |

---

### `disableShrink`

`boolean` — disables the stroke shrink/expand keyframe on the circle (`"indeterminate"` only). The container rotation continues. Useful for reduced-motion contexts.

Default: `false`.

---

### `spinning`

`boolean` — applies the rotation animation to a `"determinate"` arc. The arc length continues to reflect `value` while the whole spinner rotates, communicating "in progress at a known percentage."

Has no effect on `"indeterminate"` (which always rotates).

Default: `false`.

---

### `easing`

Timing function for the rotation animation. Applies to both `"indeterminate"` and `"determinate"` + `spinning`.

| Value           | Description                        |
| --------------- | ---------------------------------- |
| `"linear"`      | Constant speed from start to end.  |
| `"ease"`        | Slow start, fast middle, slow end. |
| `"ease-in"`     | Slow start.                        |
| `"ease-out"`    | Slow end.                          |
| `"ease-in-out"` | Slow start and slow end.           |

Default: `"linear"`.

---

### `showTrack`

`boolean` — renders a faint full-ring circle (20% opacity, same `r` and `strokeWidth`) behind the progress arc. Color inherits from the `color` prop automatically. Useful for `"determinate"` to show remaining distance.

Default: `false`.

---

## ARIA

| Variant         | Attributes set                                                             |
| --------------- | -------------------------------------------------------------------------- |
| `indeterminate` | `role="progressbar"` only                                                  |
| `determinate`   | `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |

---

## Styled-system props

### Space — `theme.space` (margin only — padding is blocked)

Padding props (`p`, `pt`, `pr`, `pb`, `pl`, `px`, `py`) are omitted at the type level because padding collapses the SVG inside the span.

| Prop                              | Shorthand for  |
| --------------------------------- | -------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides |

| Key      | Value |
| -------- | ----- |
| `0`      | 0     |
| `0.5`    | 4px   |
| `1`      | 8px   |
| `1.5`    | 12px  |
| `2`      | 16px  |
| `3`      | 24px  |
| `4`      | 32px  |
| `5`      | 40px  |
| `6`      | 48px  |
| `7`      | 56px  |
| `8`      | 64px  |
| `"auto"` | auto  |

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow`

`width` and `height` override the `size` prop when passed explicitly.

---

## Examples

```tsx
// Default indeterminate spinner
<CircularProgress />

// Determinate at 75%
<CircularProgress variant="determinate" value={75} />

// Determinate with track showing remaining distance
<CircularProgress variant="determinate" value={60} showTrack />

// Spinning determinate — arc shows progress while rotating
<CircularProgress variant="determinate" value={40} spinning showTrack />

// Custom easing on the rotation
<CircularProgress easing="ease-in-out" />

// Custom size and thickness
<CircularProgress size={64} thickness={6} color="success" />

// Custom range (0–200)
<CircularProgress variant="determinate" value={120} min={0} max={200} showTrack />

// Inside a Button — inherits button text color via currentColor
<CircularProgress size={16} color="inherit" />

// Disable shrink animation (reduced motion)
<CircularProgress disableShrink />

// String size
<CircularProgress size="3rem" />
```
