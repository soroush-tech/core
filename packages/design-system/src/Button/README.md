# Button

Renders as `<button>`. Sharp corners, uppercase, bold, tight letter-spacing — matching the Kinetic Architecture aesthetic. Supports three visual variants, six semantic color palettes, three sizes, start/end icon slots, full-width mode, and a loading state with configurable indicator position.

Button is the reference implementation for theme-level customization: `theme.components.Button` supports `defaultProps`, per-slot `styleOverrides` (`root` / `label` / `icon`), and theme-contributed `variants` — see [`docs/customization.md`](../../docs/customization.md).

---

## Button-specific props

### `variant`

Controls the visual structure of the button.

| Variant       | Style                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| `"contained"` | Filled background — `theme.palette[color].main`                          |
| `"outlined"`  | Transparent background, 1px solid border — `theme.palette[color].main`   |
| `"text"`      | Transparent background, no border — label in `theme.palette[color].main` |

Default: `"contained"`, overridable via `theme.defaults.buttonVariant` or `theme.components.Button.defaultProps`.

The value union is augmentable — register new values on the `ButtonVariants` interface and style them through `theme.components.Button.variants`:

```ts
declare module '@emotion/react' {
  interface ButtonVariants {
    dashed: true
  }
}
```

---

### `color`

Selects the color palette. Resolves against `theme.palette[color]`.

| Token         | Dark `main`         | Light `main`        |
| ------------- | ------------------- | ------------------- |
| `"primary"`   | `kineticGreen[500]` | `kineticGreen[600]` |
| `"secondary"` | `cyberCyan[500]`    | `cyberCyan[700]`    |
| `"success"`   | `kineticGreen[700]` | `kineticGreen[700]` |
| `"error"`     | `neonRed[500]`      | `neonRed[700]`      |
| `"info"`      | `cyberCyan[500]`    | `cyberCyan[800]`    |
| `"warning"`   | `solarAmber[400]`   | `solarAmber[500]`   |

Each palette entry also has `hover`, `active`, and `contrast` (the foreground text color used on `contained` buttons).

Default: `"primary"`.

---

### `size`

Maps to `theme.space` (padding) and `theme.fontSizes` (font size).

| Size   | `paddingY`          | `paddingX`          | `fontSize`            |
| ------ | ------------------- | ------------------- | --------------------- |
| `"sm"` | `space[0.5]` (4px)  | `space[1.5]` (12px) | `fontSizes[0]` (12px) |
| `"md"` | `space[1]` (8px)    | `space[2]` (16px)   | `fontSizes[1]` (14px) |
| `"lg"` | `space[1.5]` (12px) | `space[3]` (24px)   | `fontSizes[1]` (14px) |

Default: `"md"`.

---

### `startIcon`

`ReactNode` — rendered before the label inside a flex span. When `loading=true` and `loadingPosition="start"`, the `startIcon` is replaced by the loading indicator.

---

### `endIcon`

`ReactNode` — rendered after the label inside a flex span. When `loading=true` and `loadingPosition="end"`, the `endIcon` is replaced by the loading indicator.

---

### `fullWidth`

`boolean` — applies `width: 100%`. Default: `false`.

---

### `disabled`

`boolean` — disables the button (native HTML attribute). Applies `opacity: 0.5` and `cursor: not-allowed`. Default: `false`.

---

### `loading`

`boolean` — shows the loading indicator and disables the button. Default: `false`.

---

### `loadingIndicator`

`ReactNode` — custom loading element. Default: `<CircularProgress size={16} color="inherit" />`, which inherits the button's text color via `currentColor` and works across all variants and color palettes.

---

### `loadingPosition`

Where the loading indicator appears relative to the button label.

| Value      | Behaviour                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| `"start"`  | Replaces `startIcon`; label remains visible                                               |
| `"end"`    | Replaces `endIcon`; label remains visible                                                 |
| `"center"` | Label is hidden (`visibility: hidden`) to preserve width; indicator is absolutely centred |

Default: `"center"`.

---

### `href`

`string` — the URL to link to when the button is clicked. If defined, an `<a>` element is used as the root node. The button keeps its full styling and prop API.

> A native `<a>` cannot be disabled — when `href` is set, `disabled`/`loading` dim the link but do not block navigation.

---

## Styled-system props

### Space — `theme.space`

| Prop                              | Shorthand for   |
| --------------------------------- | --------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides  |
| `p` `pt` `pr` `pb` `pl` `px` `py` | padding + sides |

---

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow`

---

### Border — `theme.radii` / `theme.borderWidths`

`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius` · sides

> Passing `borderRadius` overrides the default `0` (sharp corners).

---

## Base styles

All buttons apply these styles regardless of variant:

| Property        | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| `textTransform` | `uppercase`                                                          |
| `fontWeight`    | `theme.fontWeights.bold` (700)                                       |
| `letterSpacing` | `theme.letterSpacings.tight` (-0.025em)                              |
| `lineHeight`    | `1`                                                                  |
| `borderRadius`  | `0` (sharp corners)                                                  |
| `transition`    | `background-color`, `color`, `border-color`, `opacity` at 0.15s ease |

---

## Examples

```tsx
// Variants
<Button variant="contained">Deploy</Button>
<Button variant="outlined">Cancel</Button>
<Button variant="text">Learn more</Button>

// Colors
<Button color="error" variant="contained">Delete</Button>
<Button color="success">Confirm</Button>
<Button color="warning" variant="outlined">Proceed with caution</Button>

// Sizes
<Button size="sm">SM</Button>
<Button size="lg">Deploy System</Button>

// Icons
<Button startIcon={<Icon />}>Upload</Button>
<Button endIcon={<ArrowIcon />} variant="text">Continue</Button>

// Full width
<Button fullWidth>Submit</Button>

// Loading — center (default)
<Button loading>Processing</Button>

// Loading — start position
<Button loading loadingPosition="start" startIcon={<Icon />}>Saving</Button>

// Custom loading indicator
<Button loading loadingIndicator={<MySpinner />}>Processing</Button>

// Disabled
<Button disabled>Unavailable</Button>

// As a link — renders an <a href>
<Button href="/docs">Read the docs</Button>

// Styled-system overrides
<Button mt={2} px={4}>Custom spacing</Button>
<Button borderRadius="md">Rounded</Button>
```
