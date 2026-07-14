# AppBar

Renders as `<header>`. A top-level container for navigation, toolbars, and application headers. Applies a default elevation shadow from the theme and stretches to full width.

---

## AppBar-specific props

### `color`

Resolves against `theme.background` — sets the AppBar's background color.

| Token         | Dark source                      | Light source                        |
| ------------- | -------------------------------- | ----------------------------------- |
| `"appBar"`    | `blackAlpha[700]`                | `lightSurface[100]` + 80% opacity   |
| `"backdrop"`  | `carbonBlack[900]` + 80% opacity | `kineticSurface[100]` + 80% opacity |
| `"modal"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"primary"`   | `kineticSurface[900]`            | `kineticSurface[50]`                |
| `"secondary"` | `kineticSurface[700]`            | `carbonBlack[100]`                  |
| `"paper"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"terminal"`  | `carbonBlack[900]`               | `carbonBlack[100]`                  |
| `"grid"`      | `kineticGreen[500]` + 5% opacity | `kineticGreen[600]` + 10% opacity   |

---

### `size`

Padding preset — resolves from `theme.sizes`. Default: `"md"`.

| Value  | `paddingLeft` / `paddingRight` | `paddingTop` / `paddingBottom` |
| ------ | ------------------------------ | ------------------------------ |
| `"sm"` | `theme.space[1.5]` (12px)      | `theme.space[0.5]` (4px)       |
| `"md"` | `theme.space[2]` (16px)        | `theme.space[1]` (8px)         |
| `"lg"` | `theme.space[3]` (24px)        | `theme.space[1.5]` (12px)      |

Override individual sides with `px` / `py` (or `pl`, `pr`, `pt`, `pb`) from the space styled-system group.

---

### `elevation`

Box-shadow depth — resolves from `theme.shadows[n]`. Omit for no shadow. Accepts any integer 0–24.

| Value | Shadow                          |
| ----- | ------------------------------- |
| `0`   | `theme.shadows[0]` (no shadow)  |
| `4`   | `theme.shadows[4]` _(default)_  |
| `8`   | `theme.shadows[8]`              |
| `24`  | `theme.shadows[24]` (max depth) |

---

### `position`

Controls CSS layout positioning.

| Value        | Behavior                                                   |
| ------------ | ---------------------------------------------------------- |
| `"static"`   | Browser default — part of normal document flow             |
| `"relative"` | Offset from normal position; still occupies its space      |
| `"absolute"` | Removed from flow; positioned relative to nearest ancestor |
| `"fixed"`    | Fixed to the viewport; does not scroll with the page       |
| `"sticky"`   | Sticks to its nearest scroll ancestor at a given offset    |

For `"fixed"` and `"sticky"`, combine with `top`, `left`, `right` from the position styled-system group. AppBar already applies a default `zIndex` of `theme.zOrder.appBar` so it layers above page content; pass the `zIndex` prop to override it.

---

### `blur`

Applies `backdrop-filter: blur(theme.blur)` (and the `-webkit-` prefix) for a frosted-glass effect. The blur amount is read from `theme.blur` (`12px`).

Combine with `color="backdrop"`, which resolves to the theme's pre-composited frosted background (`theme.background.backdrop`):

```tsx
<AppBar color="backdrop" blur position="fixed" top={0}>
  ...
</AppBar>
```

| Value             | Effect                     |
| ----------------- | -------------------------- |
| `true`            | Frosted-glass blur applied |
| `false` / omitted | No blur                    |

---

### Borders

`AppBar` supports the following border styled-system props. `borderRadius` is intentionally excluded — AppBar is a full-width bar and does not use rounded corners.

| Prop           | CSS property    |
| -------------- | --------------- |
| `border`       | `border`        |
| `borderTop`    | `border-top`    |
| `borderRight`  | `border-right`  |
| `borderBottom` | `border-bottom` |
| `borderLeft`   | `border-left`   |
| `borderWidth`  | `border-width`  |
| `borderStyle`  | `border-style`  |
| `borderColor`  | `border-color`  |

---

## Default styles

| Property                       | Value                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| `display`                      | `flex`                                                         |
| `flexDirection`                | `column`                                                       |
| `flexShrink`                   | `0`                                                            |
| `width`                        | `100%`                                                         |
| `boxShadow`                    | none (set via `elevation` prop)                                |
| `paddingLeft` / `paddingRight` | `theme.space[2]` (16px, `md`)                                  |
| `paddingTop` / `paddingBottom` | `theme.space[1]` (8px, `md`)                                   |
| `zIndex`                       | `theme.zOrder.appBar` (1100) — override with the `zIndex` prop |

---

## Styled-system props

### Space — `theme.space`

| Prop                              | Shorthand for   |
| --------------------------------- | --------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides  |
| `p` `pt` `pr` `pb` `pl` `px` `py` | padding + sides |

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

---

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow` · `overflowX` · `overflowY` · `verticalAlign`

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

### Borders

`border` · `borderTop` · `borderRight` · `borderBottom` · `borderLeft` · `borderWidth` · `borderStyle` · `borderColor`

> `borderRadius` is not supported on AppBar.

---

### HTML attributes

`AppBar` extends `HTMLAttributes<HTMLElement>` (minus `color`, which is overridden). All standard attributes pass through: `style`, `className`, `onClick`, `data-*`, `aria-*`, etc.

---

## Examples

```tsx
// Background color from theme
<AppBar color="paper">...</AppBar>
<AppBar color="primary">...</AppBar>

// Fixed to the top of the viewport
<AppBar color="paper" position="fixed" top={0} zIndex={1100}>
  <nav>...</nav>
</AppBar>

// Sticky — stays in flow until it hits the scroll boundary
<AppBar color="paper" position="sticky" top={0} zIndex={100}>
  <nav>...</nav>
</AppBar>

// Custom width override
<AppBar color="paper" maxWidth="960px" mx="auto">
  <nav>...</nav>
</AppBar>

// Spacing inside
<AppBar color="paper" px={3} py={2}>
  <Typography variant="h6" color="primary">App</Typography>
</AppBar>
```
