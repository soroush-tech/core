# ColorPalette

Displays a named color palette as a card: a header swatch showing the base color with contrast-aware text, followed by a strip of numbered shade swatches.

---

## Props

### `name`

`string` — Label rendered in the header row. Displayed as an overline above the base hex value.

---

### `palette`

`Record<string | number, string>` — Color map where `base` is the header color and numeric keys (`100`–`900`) are the shade strip entries.

```ts
// Example palette shape
{
  base: '#00FC40',
  100: '#E6FFF0',
  200: '#B3FFD1',
  // ...
  900: '#003D10',
}
```

All registered palettes are in `@soroush.tech/design-system/colors/`.

---

## Contrast text

The header text color is chosen automatically based on the perceived luminance of `palette.base`:

- Luminance > 0.5 → `#000000` (dark text)
- Luminance ≤ 0.5 → `#ffffff` (light text)

These two values are intentional hardcodes — they are CSS-standard black and white used solely for contrast enforcement, not theme tokens.

---

## Layout

The card is `288px` wide and composed of two rows:

| Row         | Height | Content                                     |
| ----------- | ------ | ------------------------------------------- |
| Header      | `96px` | Base swatch + palette name + base hex value |
| Shade strip | `48px` | One swatch per numeric shade key            |

Each shade swatch exposes its hex value as a `title` tooltip.

---

## Examples

```tsx
import { kineticGreen } from '@soroush.tech/design-system/colors/kineticGreen'
;<ColorPalette name="PRIMARY" palette={kineticGreen} />
```

```tsx
// All registered palettes
import * as colors from '@soroush.tech/design-system/colors'

Object.entries(colors).map(([name, palette]) => (
  <ColorPalette key={name} name={name} palette={palette} />
))
```
