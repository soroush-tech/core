# LinearProgress

Renders a horizontal loading bar — the linear counterpart of `CircularProgress`. Supports `indeterminate` (looping), `determinate` (value-driven), and `query` (reversed loop) variants, plus a `buffer` mode on top of `determinate`. All fills use CSS `currentColor`; the `color` prop resolves to `theme.palette[color].main`.

**Architecture:** the root element is a `<span>` (display block, `thickness` tall, full width, `overflow: hidden`) that establishes the color context. The track, buffer bar, and primary bar are absolutely positioned spans inside it, all painted with `currentColor` at different opacities — no extra color tokens needed. Value-driven bars translate with `transform: translateX(...)` so progress updates animate on the compositor.

---

## Props

### `variant`

| Value             | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| `"indeterminate"` | Continuous looping animation — use when progress is unknown.                          |
| `"determinate"`   | Bar width driven by `value` — use when progress is measurable.                        |
| `"query"`         | The `indeterminate` animation played in the reverse direction (root is flipped 180°). |

Default: `"indeterminate"`.

---

### `color`

Resolves to `theme.palette[color].main`. `"inherit"` forwards `currentColor` from the parent. The track (20% opacity) and buffer bar (40% opacity) derive from the same resolved color automatically.

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

### `thickness`

Bar height. Number → appended as `px`; string → used as-is (e.g. `'0.5rem'`). The layout `height` prop overrides it when passed explicitly.

Default: `4`.

---

### `value` / `min` / `max`

`value` drives the primary bar for the `"determinate"` variant. It is clamped to `[min, max]` via `@soroush.tech/design-system/utils/clamp` before rendering.

| Prop    | Default                     |
| ------- | --------------------------- |
| `value` | `min` (i.e. 0) when omitted |
| `min`   | `0`                         |
| `max`   | `100`                       |

---

### `buffer` / `valueBuffer`

`buffer` (boolean) renders a semi-transparent buffer bar behind a `"determinate"` bar, driven by `valueBuffer` (clamped to `[min, max]`), and swaps the solid track for a dotted leading edge. Typical for media playback: `value` = played, `valueBuffer` = buffered.

Has no effect on `"indeterminate"` and `"query"`.

| Prop          | Default                     |
| ------------- | --------------------------- |
| `buffer`      | `false`                     |
| `valueBuffer` | `min` (i.e. 0) when omitted |

---

### `spinning`

`boolean` — sends the filled segment travelling along a `"determinate"` track. The segment's length always equals `value`, and as its leading edge passes the end of the track the remainder re-enters from the beginning (wrap-around) — the linear analog of `CircularProgress`'s rotating determinate arc.

Implemented as two value-length segments one full track width apart on a carrier that translates by 100% per cycle, so the wrap is seamless.

Has no effect on `"indeterminate"` and `"query"` (which always animate).

Default: `false`.

---

### `easing`

Timing function for the `"determinate"` value transition and the `spinning` travel. The `"indeterminate"`/`"query"` keyframes keep their tuned cubic-bezier curves.

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

`boolean` — renders the faint background track (20% opacity `currentColor`), or the dotted leading edge when `buffer` is set. Disable it for a bar that floats on the page background.

Default: `true`.

---

### `round`

`boolean` — rounds the bar's corners into a pill shape (same radius literal `Button`'s `"pill"` shape uses). The root's `overflow: hidden` clips the inner bars to the radius.

Default: `false`.

---

## ARIA

| Variant                   | Attributes set                                                             |
| ------------------------- | -------------------------------------------------------------------------- |
| `indeterminate` / `query` | `role="progressbar"` only                                                  |
| `determinate`             | `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |

The root carries a default `aria-label="Loading"`; pass your own `aria-label` to override it.

When the bar describes the loading progress of a particular page region, point to it from that region with `aria-describedby` and set `aria-busy="true"` on the region until loading finishes:

```tsx
<section aria-busy={isLoading} aria-describedby="feed-progress">
  <LinearProgress id="feed-progress" />
  ...
</section>
```

---

## Styled-system props

### Space — `theme.space` (margin only — padding is blocked)

Padding props (`p`, `pt`, `pr`, `pb`, `pl`, `px`, `py`) are omitted at the type level because padding would offset the absolutely positioned bars inside the root.

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

`height` overrides the `thickness` prop; `width` overrides the 100% default.

---

## Examples

```tsx
// Default indeterminate bar
<LinearProgress />

// Determinate at 75%
<LinearProgress variant="determinate" value={75} />

// Buffer — 40% played, 70% buffered
<LinearProgress variant="determinate" buffer value={40} valueBuffer={70} />

// Query — reversed indeterminate animation
<LinearProgress variant="query" />

// Spinning determinate — the value-length segment travels and wraps around
<LinearProgress variant="determinate" value={40} spinning />

// Custom easing on the transition and travel
<LinearProgress variant="determinate" value={40} spinning easing="ease-in-out" />

// Custom range (0–200)
<LinearProgress variant="determinate" value={120} min={0} max={200} />

// Thicker bar
<LinearProgress thickness={8} color="success" />

// Pill corners
<LinearProgress variant="determinate" value={65} thickness={8} round />

// No background track
<LinearProgress variant="determinate" value={65} showTrack={false} />

// Inherits parent text color via currentColor
<LinearProgress color="inherit" />
```
