# Skeleton

Displays a low-fidelity placeholder while content loads, reducing layout shift and signalling a loading state. Supports three shapes, two animations (or none), explicit or child-inferred dimensions, and derives all colors from theme tokens.

---

## Animation sync

The two animations behave differently when several skeletons share a page:

- **`pulse`** (default) fades opacity only, so it is **size-independent** — a small circle and a full-width bar fade identically and, when rendered together, stay in lockstep with no extra work.
- **`wave`** anchors its shimmer gradient to the **viewport** (`background-attachment: fixed`) rather than to each element. One light band sweeps across the whole page and every skeleton reveals the slice under it, so differing widths and heights all stay visually in sync.

Both animations are disabled automatically under `prefers-reduced-motion: reduce`.

---

## Skeleton-specific props

### `variant`

Controls the shape via a default `border-radius`.

| Value           | default border-radius  |
| --------------- | ---------------------- |
| `"text"`        | `theme.radii.sm` (4px) |
| `"circular"`    | `50%`                  |
| `"rectangular"` | `theme.radii.sq` (0)   |

Default: `"text"`. The `text` variant with no `height` takes one line's height via an inserted non-breaking space. Use `borderRadius` for rounded rectangles.

---

### `borderRadius`

Overrides the variant's default corner radius — resolves against `theme.radii`. The `circular` variant ignores it — a circle always stays `50%`.

| Token    | Value |
| -------- | ----- |
| `"sq"`   | 0     |
| `"sm"`   | 4px   |
| `"md"`   | 8px   |
| `"lg"`   | 16px  |
| `"12px"` | raw   |

```tsx
<Skeleton variant="rectangular" borderRadius="md" width="100%" height={120} />
```

---

### `animation`

| Value     | Effect                                             |
| --------- | -------------------------------------------------- |
| `"pulse"` | Opacity fade (default). Size-independent.          |
| `"wave"`  | Viewport-anchored shimmer sweep. Size-independent. |
| `false`   | No animation.                                      |

Default: `"pulse"`.

---

### `width` / `height`

`number | string`. A number resolves to `px`; a string is used as-is (`'10rem'`, `'50%'`). When `width` is omitted and `children` are present, width becomes `fit-content` so the skeleton matches the content it stands in for.

---

### `children`

Optional content used only to infer width and height — it is rendered invisibly (`visibility: hidden`) so the skeleton sizes to it.

```tsx
<Skeleton>
  <Typography variant="h3">Loading title</Typography>
</Skeleton>
```

---

## Styled-system props

Skeleton accepts margin props (`m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`) — resolved against `theme.space`. Padding is intentionally excluded. The root element can be changed with `as`.

---

## Examples

```tsx
// Single line of text
<Skeleton width={240} />

// Shapes
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" borderRadius="md" width="100%" height={120} />

// Wave shimmer, in sync across differing sizes
<Skeleton variant="rectangular" borderRadius="md" width="90%" height={20} animation="wave" />
<Skeleton variant="rectangular" borderRadius="md" width="40%" height={20} animation="wave" />

// No animation
<Skeleton width={200} animation={false} />

// Infer size from children
<Skeleton>
  <Typography variant="h3">Loading title</Typography>
</Skeleton>

// Avatar + two text lines
<Flex gap={2} alignItems="center">
  <Skeleton variant="circular" width={40} height={40} />
  <Flex flexDirection="column" gap={1} flex={1}>
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="40%" />
  </Flex>
</Flex>
```
