# Link

Renders as `<a>`. Composes `Typography` — all typographic scale, color, spacing, and layout props are inherited. Adds `underline`, and defaults `color` to `"primary"` and `variant` to `"inherit"`.

Setting `target="_blank"` automatically injects `rel="noopener noreferrer"` unless `rel` is explicitly provided.

---

## Link-specific props

### `underline`

Controls `text-decoration`.

| Value      | Behaviour                                        |
| ---------- | ------------------------------------------------ |
| `"always"` | `text-decoration: underline` (default)           |
| `"hover"`  | No underline at rest; underline appears on hover |
| `"none"`   | `text-decoration: none`                          |

---

### `color`

Resolves against `theme.text`. Default: `"primary"`.

| Token         | Dark source           | Light source                        |
| ------------- | --------------------- | ----------------------------------- |
| `"inherit"`   | CSS keyword           | CSS keyword                         |
| `"initial"`   | `kineticSurface[100]` | `kineticSurface[900]`               |
| `"primary"`   | `kineticGreen[500]`   | `kineticSurface[900]`               |
| `"secondary"` | `kineticSurface[400]` | `kineticGreen[800]`                 |
| `"disabled"`  | `kineticSurface[500]` | `kineticSurface[900]` + 30% opacity |
| `"error"`     | `neonRed[700]`        | `neonRed[700]`                      |
| `"success"`   | `kineticGreen[700]`   | `kineticGreen[700]`                 |
| `"info"`      | `cyberCyan[500]`      | `cyberCyan[800]`                    |
| `"warning"`   | `solarAmber[800]`     | `solarAmber[800]`                   |

---

### `variant`

Typographic scale — same values as `Typography`. Default: `"inherit"` (link takes the size and weight of its surrounding text).

| Variant       | fontSize              | fontWeight      |
| ------------- | --------------------- | --------------- |
| `"inherit"`   | inherit               | inherit         |
| `"body1"`     | 2 (16px)              | normal          |
| `"body2"`     | 1 (14px)              | normal          |
| `"caption"`   | 0 (12px)              | normal          |
| `"h1"`–`"h6"` | 6–1 (48–14px)         | bold / semiBold |
| …             | see Typography README |                 |

---

## Anchor attributes

All standard anchor attributes pass through: `href`, `target`, `rel`, `download`, `hrefLang`, `ping`, `referrerPolicy`.

### `target` / `rel` — security

When `target="_blank"` is set and `rel` is **not** provided, `rel="noopener noreferrer"` is injected automatically. An explicit `rel` prop is never overridden.

---

## Inherited from Typography

`Link` extends `Omit<TypographyProps, 'as'>`. All Typography props are valid — see the [Typography README](../Typography/README.md) for the full list:

- **Spacing** — `m`, `p`, `mt`, `mb`, `mx`, `my`, …
- **Layout** — `width`, `maxWidth`, `display`, …
- **Typography scales** — `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
- **Color** — `bg`, `opacity`
- **Flexbox, Border, Position**

---

## Examples

```tsx
// Defaults: color="primary", underline="always", variant="inherit"
<Link href="/docs">Read the docs</Link>

// Open in new tab — rel injected automatically
<Link href="https://example.com" target="_blank">External site</Link>

// Suppress underline on navigation links
<Link href="/about" underline="none">About</Link>

// Inline prose — hover underline, muted color
<Typography variant="body1">
  See the <Link href="/docs" underline="hover" color="secondary">docs</Link> for details.
</Typography>

// Specific typographic scale
<Link href="#" variant="caption" color="secondary">View source</Link>

// Spacing and layout
<Link href="#" m={2} display="block">Block-level link</Link>
```
