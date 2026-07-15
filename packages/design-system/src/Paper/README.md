# Paper

An elevated surface primitive that extends `View`. Adds visual surface styling — shadow via `theme.shadows`, a default `bg="paper"` background, and a default `borderRadius="md"`. Consumers compose `Flex` or `Grid` inside `Paper` for layout.

---

## Paper-specific props

### `elevation`

Shadow depth from 0 (flat) to 24 (highest). Resolves to `theme.shadows[n]` which produces a `box-shadow` string.

| Value | `box-shadow`                     |
| ----- | -------------------------------- |
| `0`   | `0 0px 0px rgba(0, 0, 0, 0.1)`   |
| `1`   | `0 1px 2px rgba(0, 0, 0, 0.1)`   |
| `4`   | `0 4px 8px rgba(0, 0, 0, 0.1)`   |
| `8`   | `0 8px 16px rgba(0, 0, 0, 0.1)`  |
| `24`  | `0 24px 48px rgba(0, 0, 0, 0.1)` |

Default: `1`.

---

### `aspectRatio`

CSS `aspect-ratio` for fixed-ratio surfaces. Accepts any valid CSS value (e.g. `"1"`, `"4/3"`, `"16/9"`). No theme scale — raw CSS.

---

### `transition`

CSS `transition` for surface animations, typically used for hover elevation changes. No theme scale — raw CSS.

```tsx
<Paper
  elevation={1}
  transition="box-shadow 0.3s ease"
  css={{ '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}
/>
```

---

## Default styles

| Prop           | Default   | Resolves to                 |
| -------------- | --------- | --------------------------- |
| `bg`           | `"paper"` | `theme.background.paper`    |
| `borderRadius` | `"md"`    | `theme.radii.md` = `8px`    |
| `elevation`    | `1`       | `0 1px 2px rgba(0,0,0,0.1)` |

---

## `bg` — `theme.background`

| Token         | Dark source                      | Light source                        |
| ------------- | -------------------------------- | ----------------------------------- |
| `"backdrop"`  | `carbonBlack[900]` + 80% opacity | `kineticSurface[100]` + 80% opacity |
| `"modal"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"primary"`   | `kineticSurface[900]`            | `kineticSurface[50]`                |
| `"secondary"` | `kineticSurface[700]`            | `carbonBlack[100]`                  |
| `"paper"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |

---

## Inherited props from View

### Space — `theme.space`

| Prop                              | Shorthand for   |
| --------------------------------- | --------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides  |
| `p` `pt` `pr` `pb` `pl` `px` `py` | padding + sides |

---

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow` · `overflowX` · `overflowY`

---

### Border — `theme.radii`

`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius` · `borderTop` · `borderRight` · `borderBottom` · `borderLeft`

Radii: `"sm"` (4px) · `"md"` (8px) · `"lg"` (16px)

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

### `cursor`

Raw CSS cursor value (e.g. `"pointer"`, `"default"`).

---

## Composition

`Paper` has no flex or grid props. Nest `Flex` or `Grid` inside for layout:

```tsx
<Paper elevation={2} p={3}>
  <Flex alignItems="center" gap={2}>
    <Avatar src="/photo.jpg" alt="Jane" />
    <Typography variant="body1">Jane Doe</Typography>
  </Flex>
</Paper>

<Paper elevation={1} aspectRatio="16/9">
  <Flex height="100%" alignItems="center" justifyContent="center">
    <Typography variant="h4">16:9 Surface</Typography>
  </Flex>
</Paper>
```
