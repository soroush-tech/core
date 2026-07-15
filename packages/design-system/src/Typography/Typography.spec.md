# Typography

Renders as `<p>` by default. The `variant` prop controls both the visual scale and the HTML element. All styled-system prop groups are supported, plus five Typography-specific props.

---

## Typography-specific props

### `variant`

Maps the component to a semantic HTML element and applies a typographic scale from the theme.

| Variant     | Element  | fontSize | fontWeight                                   |
| ----------- | -------- | -------- | -------------------------------------------- |
| `h1`        | `<h1>`   | 6 (48px) | bold                                         |
| `h2`        | `<h2>`   | 5 (32px) | bold                                         |
| `h3`        | `<h3>`   | 4 (24px) | bold                                         |
| `h4`        | `<h4>`   | 3 (20px) | bold                                         |
| `h5`        | `<h5>`   | 2 (16px) | bold                                         |
| `h6`        | `<h6>`   | 1 (14px) | semiBold                                     |
| `subtitle1` | `<h6>`   | 2 (16px) | medium                                       |
| `subtitle2` | `<h6>`   | 1 (14px) | medium                                       |
| `body1`     | `<p>`    | 2 (16px) | normal                                       |
| `body2`     | `<p>`    | 1 (14px) | normal                                       |
| `caption`   | `<span>` | 0 (12px) | normal                                       |
| `overline`  | `<span>` | 0 (12px) | medium + uppercase + `letterSpacing="wider"` |
| `button`    | `<span>` | 1 (14px) | medium + uppercase + `letterSpacing="wide"`  |
| `inherit`   | `<p>`    | inherit  | inherit                                      |

Default: `body1`. Individual props (`fontSize`, `fontWeight`, etc.) **override** variant styles when both are provided.

---

### `color`

Resolves against `theme.text`. All 9 semantic tokens are available:

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

### `align`

| Value       | CSS                                                                        |
| ----------- | -------------------------------------------------------------------------- |
| `"left"`    | `text-align: left`                                                         |
| `"center"`  | `text-align: center`                                                       |
| `"right"`   | `text-align: right`                                                        |
| `"justify"` | `text-align: justify` — stretches wrapped lines only; last line stays left |
| `"inherit"` | `text-align: inherit`                                                      |

---

### `gutterBottom`

`boolean` — adds `margin-bottom: 0.5em`. Useful between a heading and the following paragraph without needing a space prop.

---

### `noWrap`

`boolean` — applies `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`. The element must have a constrained width for truncation to trigger.

---

### `as`

Overrides the HTML element chosen by `variant` while keeping its visual styles.

```tsx
<Typography variant="h1" as="div" />       // div with h1 styles
<Typography variant="body1" as="span" />   // inline with body1 styles
<Typography variant="inherit" as="code" /> // code element, inherits styles
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

### `bg` — `theme.background`

| Token         | Dark source                      | Light source                        |
| ------------- | -------------------------------- | ----------------------------------- |
| `"backdrop"`  | `carbonBlack[900]` + 80% opacity | `kineticSurface[100]` + 80% opacity |
| `"modal"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |
| `"primary"`   | `kineticSurface[900]`            | `kineticSurface[50]`                |
| `"secondary"` | `kineticSurface[700]`            | `carbonBlack[100]`                  |
| `"paper"`     | `kineticSurface[800]`            | `kineticSurface[100]`               |

---

### Typography — theme scales

| Prop            | CSS property   | Scale                          |
| --------------- | -------------- | ------------------------------ |
| `fontFamily`    | font-family    | `theme.fonts` keyword          |
| `fontSize`      | font-size      | `theme.fontSizes` index        |
| `fontWeight`    | font-weight    | `theme.fontWeights` keyword    |
| `lineHeight`    | line-height    | `theme.lineHeights` keyword    |
| `letterSpacing` | letter-spacing | `theme.letterSpacings` keyword |
| `textAlign`     | text-align     | raw CSS (prefer `align` prop)  |
| `fontStyle`     | font-style     | raw CSS                        |

> **Constraint:** `textTransform` has no styled-system function — it must live in a `styled(Typography)` CSS template literal or inside a `variant()` definition.

**Font family — `theme.fonts`**

| Key         | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| `"body"`    | `'Space Grotesk', sans-serif`                               |
| `"heading"` | `'Space Grotesk', sans-serif`                               |
| `"mono"`    | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace` |

**Font size — `theme.fontSizes` (pass index)**

| Index | px  |
| ----- | --- |
| `0`   | 12  |
| `1`   | 14  |
| `2`   | 16  |
| `3`   | 20  |
| `4`   | 24  |
| `5`   | 32  |
| `6`   | 48  |

**Font weight — `theme.fontWeights` (pass keyword)**

| Keyword        | Weight |
| -------------- | ------ |
| `"thin"`       | 100    |
| `"extraLight"` | 200    |
| `"light"`      | 300    |
| `"normal"`     | 400    |
| `"medium"`     | 500    |
| `"semiBold"`   | 600    |
| `"bold"`       | 700    |
| `"extraBold"`  | 800    |
| `"black"`      | 900    |

**Line height — `theme.lineHeights` (pass keyword)**

| Keyword     | Value | Use                |
| ----------- | ----- | ------------------ |
| `"none"`    | 1     | tight display text |
| `"tight"`   | 1.2   | headings           |
| `"snug"`    | 1.35  | sub-headings       |
| `"base"`    | 1.5   | body text          |
| `"relaxed"` | 1.625 | readable long-form |
| `"loose"`   | 2     | wide airy layouts  |

**Letter spacing — `theme.letterSpacings` (pass keyword)**

| Keyword     | Value    |
| ----------- | -------- |
| `"tighter"` | -0.05em  |
| `"tight"`   | -0.025em |
| `"normal"`  | 0em      |
| `"wide"`    | 0.05em   |
| `"wider"`   | 0.1em    |
| `"widest"`  | 0.2em    |

---

### Flexbox

`alignItems` · `alignContent` · `justifyContent` · `justifyItems` · `flexDirection` · `flexWrap` · `flex` · `flexGrow` · `flexShrink` · `flexBasis` · `alignSelf` · `justifySelf` · `order`

---

### Border — `theme.radii`

`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius` · `borderTop` · `borderRight` · `borderBottom` · `borderLeft` · `borderX` · `borderY`

Radii: `"sm"` (4px) · `"md"` (8px) · `"lg"` (16px)

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

### HTML attributes

`Typography` extends `HTMLAttributes<HTMLElement>` (minus `color`, which is overridden). All standard attributes pass through: `style`, `className`, `onClick`, `data-*`, `aria-*`, etc.

---

## Examples

```tsx
// Variant — element + scale
<Typography variant="h1">Heading</Typography>        // → <h1> 48px bold
<Typography variant="body2" color="secondary" />     // → <p> 14px muted
<Typography variant="caption" color="disabled" />    // → <span> 12px dimmed

// Semantic text colors (theme.text)
<Typography color="error">Validation failed</Typography>
<Typography color="success">Saved successfully</Typography>
<Typography color="info">Read the docs</Typography>
<Typography color="warning">Proceed with caution</Typography>

// Override element while keeping variant styles
<Typography variant="h2" as="div" />

// Alignment
<Typography variant="body1" align="justify" />

// Truncation (container must have a fixed width)
<Typography noWrap />

// Spacing between heading and body
<Typography variant="h3" gutterBottom />

// Theme typography scales
<Typography lineHeight="relaxed" letterSpacing="wide" />
<Typography fontFamily="mono" fontSize={0} />
<Typography fontWeight="semiBold" />

// Background from theme.background
<Typography bg="primary" color="initial" />

// Extend with styled() — textTransform must live here
const Label = styled(Typography)`
  text-transform: uppercase;
`
```
