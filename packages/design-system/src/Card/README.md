# Card

A surface component with an optional title, caption, and variant-based visual treatment. Extends `Paper` — all `Paper`, `Flex`, and space/layout props pass through.

---

## Card-specific props

### `variant`

Selects the surface's visual treatment. All variants render a `Paper` surface.

| Value           | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `"paper"`       | Standard elevated `Paper` surface. Default.                          |
| `"bracketBox"`  | Square top-left / bottom-right corners with bracket pseudo-elements. |
| `"interactive"` | Hover fills the surface with the `secondary` background.             |

Default: `"paper"`.

---

### `icon`

`IconName` — Registry name of an icon rendered as the topmost element of the card. Omit to render no icon.

```tsx
<Card icon="account_tree" title="Scalability" />
```

---

### `title`

`string` — Rendered as a `caption` Typography with `color="primary"` and `fontFamily="mono"`. Omit to suppress the title entirely.

---

### `caption`

`string` — Rendered as a `caption` Typography with `color="secondary"`. Omit to suppress.

---

### `iconProps`

`Omit<IconProps, 'name'>` — Spread onto the `Icon` to override its `color`, `size`, spacing, etc.

```tsx
<Card icon="smart_toy" iconProps={{ color: 'primary', size: '2.25rem' }} />
```

---

### `titleProps`

`Omit<TypographyProps, 'children'>` — Spread on top of the title Typography defaults. Use to override any Typography prop (e.g. `color`, `fontFamily`, `mb`).

```tsx
<Card title="System" titleProps={{ color: 'secondary', mb: 2 }} />
```

---

### `captionProps`

`Omit<TypographyProps, 'children'>` — Spread on top of the caption Typography defaults.

```tsx
<Card caption="Architecture" captionProps={{ color: 'primary', mb: 0 }} />
```

---

## Default Typography

| Slot    | variant    | color       | mb  | fontFamily |
| ------- | ---------- | ----------- | --- | ---------- |
| title   | `overline` | `primary`   | 1   | `mono`     |
| caption | `caption`  | `secondary` | 5   | —          |

---

## Inherited props (from `Paper`)

### `elevation`

Shadow depth — `0` (flat) to `24` (highest). Resolves to `theme.shadows[n]`. Default: `1`.

---

### `bg` — `theme.background`

| Token         | Dark source                      | Light source                        |
| ------------- | -------------------------------- | ----------------------------------- |
| `"paper"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"primary"`   | `kineticSurface[900]`            | `kineticSurface[50]`                |
| `"secondary"` | `kineticSurface[700]`            | `carbonBlack[100]`                  |
| `"modal"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"backdrop"`  | `carbonBlack[900]` + 80% opacity | `kineticSurface[100]` + 80% opacity |

Default: `"paper"`.

---

### Layout

`flexDirection` defaults to `"column"` so title, caption, and children stack vertically. Override via prop.

---

## Examples

```tsx
// Minimal
<Card title="Performance" caption="Core Web Vitals in production." />

// BracketBox variant
<Card
  variant="bracketBox"
  elevation={0}
  title="Stack"
  caption="Current technology choices."
  p={3}
/>

// Override title Typography
<Card
  title="Component"
  titleProps={{ color: 'secondary', fontFamily: 'body' }}
  caption="Override title appearance."
/>

// With additional children
<Card variant="bracketBox" p={3} title="Tools" caption="Used daily.">
  <View mt={2}>…</View>
</Card>
```
