# View

The base layout primitive. Renders as `<div>`. All styled-system prop groups are supported: space, layout, color, typography, flexbox, border, and position.

`Flex`, `Grid`, and `Paper` all extend `View`.

---

## Props

---

### `bg`

Resolves against `theme.background`.

| Token         | Dark source                      |
| ------------- | -------------------------------- |
| `"backdrop"`  | `carbonBlack[900]` + 80% opacity |
| `"modal"`     | `kineticSurface[800]`            |
| `"primary"`   | `kineticSurface[900]`            |
| `"secondary"` | `kineticSurface[700]`            |
| `"paper"`     | `kineticSurface[800]`            |
| `"terminal"`  | `kineticSurface[900]`            |
| `"grid"`      | `kineticSurface[800]`            |

---

### `opacity`

Raw CSS opacity value (0–1).

---

### `cursor`

CSS cursor — controls the mouse pointer style. Accepts any valid CSS cursor value.

Common values: `"pointer"` · `"default"` · `"move"` · `"not-allowed"` · `"wait"` · `"grab"` · `"text"`

```tsx
<View cursor="pointer" onClick={handleClick}>
  clickable
</View>
```

---

### `order`

CSS `order` for placing a flex/grid item out of source order. Accepts a single value or a responsive array.

```tsx
// First on mobile, last in a 2-col layout, first again on wide screens
<View order={[0, 1, 1, 0]}>logo</View>
```

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

### Border — `theme.radii`

`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius` · `borderTop` · `borderRight` · `borderBottom` · `borderLeft` · `borderX` · `borderY`

Radii: `"sm"` (4px) · `"md"` (8px) · `"lg"` (16px)

---

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

## HTML attributes

Extends `HTMLAttributes<HTMLElement>`. Standard attributes (`style`, `className`, `onClick`, `data-*`, `aria-*`) pass through.

---

## Examples

```tsx
// Basic container with spacing and background
<View p={3} bg="secondary" borderRadius="md">content</View>


// Positioned overlay
<View position="relative">
  <View position="absolute" top="0" right="0" p={1}>badge</View>
</View>

```
