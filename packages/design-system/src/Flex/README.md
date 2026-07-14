# Flex

Extends [`View`](../View/). Renders as a `<div>` with `display: flex` and `flex-direction: column` by default.

All `View` props are inherited. Flex adds `gap` (resolves from `theme.space`) and the full set of CSS Flexbox layout props.

---

## Flex-specific props

### `flexDirection`

| Value              | CSS                              |
| ------------------ | -------------------------------- |
| `"column"`         | `flex-direction: column`         |
| `"row"`            | `flex-direction: row`            |
| `"column-reverse"` | `flex-direction: column-reverse` |
| `"row-reverse"`    | `flex-direction: row-reverse`    |

Default: `"column"`.

---

### `gap`

Resolves against `theme.space`. Maps to CSS `gap`.

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

## Flexbox props

| Prop             | CSS property    |
| ---------------- | --------------- |
| `flexDirection`  | flex-direction  |
| `justifyContent` | justify-content |
| `alignItems`     | align-items     |
| `alignContent`   | align-content   |
| `flexWrap`       | flex-wrap       |
| `flex`           | flex            |
| `flexGrow`       | flex-grow       |
| `flexShrink`     | flex-shrink     |
| `flexBasis`      | flex-basis      |
| `alignSelf`      | align-self      |
| `justifySelf`    | justify-self    |
| `order`          | order           |

---

## Inherited from View

See [View props](../View/README.md) for the full list: space, layout, bg, border, and position props.

---

## Examples

```tsx
// Column layout (default)
<Flex gap={2}>
  <View p={2} bg="secondary">Item 1</View>
  <View p={2} bg="secondary">Item 2</View>
</Flex>

// Row layout
<Flex flexDirection="row" gap={2}>
  <View p={2} bg="secondary">A</View>
  <View p={2} bg="secondary">B</View>
</Flex>

// Centering
<Flex justifyContent="center" alignItems="center" height="200px">
  centered
</Flex>

// Space between (row)
<Flex flexDirection="row" justifyContent="space-between" alignItems="center" p={2}>
  <View>left</View>
  <View>right</View>
</Flex>
```
