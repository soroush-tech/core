# Methodology

Methodology block for the biography page. Two columns: an image panel (circuit-board
photo dimmed behind a floating `99.9% / UPTIME_METHODOLOGY` stat) beside the
`THE_METHODOLOGY` heading and three numbered steps.

## Props

None. The section renders static content.

## Composition

| Region        | Built from                                                             |
| ------------- | ---------------------------------------------------------------------- |
| Section root  | `View as="section" bg="primary"`                                       |
| Two columns   | `Flex` (`column` → `row`), each child `flex={1}`                       |
| Image panel   | `View position="relative" aspectRatio={1}` + `Image objectFit="cover"` |
| Dimming layer | `View bg="backdrop"` absolute overlay                                  |
| Stat box      | `View bg="default"` + `Typography` (green `99.9%` + caption)           |
| Steps         | `Flex` rows: `Typography` number + `h3` title + `body2`                |

## Asset

`src/assets/methodology-circuit.png` - the Methodology photo, imported as a Vite URL
and rendered through the theme `Image`.

## Notes

- Per the **No-Line rule**, the stat box's `border-l-4` accent from the source is
  dropped; the green `99.9%` figure carries the neon accent.
- The photo is dimmed with the semi-transparent `background.backdrop` token rather
  than a CSS `filter`, keeping the panel readable without custom CSS. The source's
  `grayscale`/gradient treatment is intentionally omitted.
- Step titles use `as="h3"` to preserve heading order under the section's `h2`.

## Usage

```tsx
import { Methodology } from 'src/section/Methodology'
;<Methodology />
```
