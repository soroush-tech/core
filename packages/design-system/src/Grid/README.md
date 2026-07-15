# Grid

Extends [`View`](../View/). Renders as a `<div>` with `display: grid`.

All `View` props are inherited. Grid adds a `gap` prop and the full set of CSS Grid layout props via `styled-system`.

---

## Grid-specific props

### `gap`

Resolves against `theme.space`. Maps to CSS `gap` (shorthand for row-gap + column-gap).

| Key      | CSS value |
| -------- | --------- |
| `0`      | 0         |
| `0.5`    | 4px       |
| `1`      | 8px       |
| `1.5`    | 12px      |
| `2`      | 16px      |
| `3`      | 24px      |
| `4`      | 32px      |
| `5`      | 40px      |
| `6`      | 48px      |
| `7`      | 56px      |
| `8`      | 64px      |
| `"auto"` | auto      |

---

### Grid layout props

These map directly to CSS Grid properties and accept **raw CSS strings** — grid layout values (column sizes, area definitions, track counts) are structurally varied and can't be reduced to a fixed token set. See the [MDN CSS Grid Layout reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout) for all valid values.

| Prop                  | CSS property          |
| --------------------- | --------------------- |
| `gridTemplateColumns` | grid-template-columns |
| `gridTemplateRows`    | grid-template-rows    |
| `gridTemplateAreas`   | grid-template-areas   |
| `gridTemplate`        | grid-template         |
| `gridAutoColumns`     | grid-auto-columns     |
| `gridAutoRows`        | grid-auto-rows        |
| `gridAutoFlow`        | grid-auto-flow        |
| `gridColumn`          | grid-column           |
| `gridRow`             | grid-row              |
| `gridArea`            | grid-area             |
| `columnGap`           | column-gap            |
| `rowGap`              | row-gap               |
| `gridGap`             | gap (alias)           |

---

## Inherited from View

### Space — `theme.space`

| Prop                              | Shorthand for   |
| --------------------------------- | --------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides  |
| `p` `pt` `pr` `pb` `pl` `px` `py` | padding + sides |

---

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow` · `overflowX` · `overflowY` · `verticalAlign`

---

### Color — `theme.colors`

| Prop    | CSS property     | Scale          |
| ------- | ---------------- | -------------- |
| `color` | color            | `theme.colors` |
| `bg`    | background-color | `theme.colors` |

| Token         | Value (dark)          |
| ------------- | --------------------- |
| `"default"`   | `kineticSurface[100]` |
| `"primary"`   | `kineticGreen[500]`   |
| `"secondary"` | `cyberCyan[500]`      |

---

### Border — `theme.radii`

`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius` · `borderTop` · `borderRight` · `borderBottom` · `borderLeft` · `borderX` · `borderY`

Radii: `"sm"` (4px) · `"md"` (8px) · `"lg"` (16px)

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

### Flexbox

`alignItems` · `alignContent` · `justifyContent` · `justifyItems` · `flexDirection` · `flexWrap` · `flex` · `flexGrow` · `flexShrink` · `flexBasis` · `alignSelf` · `justifySelf` · `order`

---

## Examples

```tsx
// 3-column equal grid with theme gap
<Grid gridTemplateColumns="repeat(3, 1fr)" gap={3} />

// Named areas
<Grid
  gridTemplateAreas='"header header" "sidebar content"'
  gridTemplateColumns="200px 1fr"
  gap={2}
/>

// Auto-fill responsive columns
<Grid gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={2} p={3} />

// Child spanning columns — use gridColumn on a View/Box child
<View gridColumn="1 / -1" />
```

---

## References

- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout) — complete guide to all grid properties and values
- [styled-system grid docs](https://styled-system.com/api#grid-layout) — prop-to-CSS mapping reference
