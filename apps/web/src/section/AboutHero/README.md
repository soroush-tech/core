# AboutHero

Full-viewport hero for the about page: a large headline ("18 Years of **Software
Evolution**"), a subtitle, and two CTAs, beside a framed portrait with corner HUD
readouts and an offset depth block.

## Props

None. The section renders static content.

## Composition

| Region       | Built from                                                     |
| ------------ | -------------------------------------------------------------- |
| Section root | `Flex as="section" bg="primary"` (`minHeight: 100vh`, centred) |
| Layout grid  | `Grid` (`1fr` → `7fr 5fr` on desktop), capped at `1280px`      |
| Accent rule  | `View height="1px" bg="primary"`                               |
| Headline     | `Typography variant="h1"` at raw `fontSize` 3.75rem → 6rem     |
| CTAs         | `Button` `contained` (+ `terminal` glyph) and `outlined`       |
| Portrait     | `styled` `ImageFrame` + `PortraitImage` + `ImageScrim` + HUD   |
| Depth block  | `styled` `OffsetBlock` behind the frame                        |

## Assets

- `src/assets/masoud_soroush.png` (+ `@2x` / `@3x` retina) - the portrait, imported as Vite URLs and served via `srcSet`.
- `src/assets/icons/terminal.svg` - button glyph (existing).

## Custom CSS (approved)

Unlike the other sections, this hero reproduces the source design 1:1, so it uses
`styled` where theme token props cannot express the visuals:

- **`PortraitImage`** - `grayscale` + `contrast` + `mix-blend-mode: screen` (CSS filters).
- **`MatrixGradient`** / **`ImageScrim`** - `linear-gradient` overlays.
- **`ImageFrame`** / **`OffsetBlock`** - thin borders (`border.primary` @20%, `border.light`)
  and elevation; these intentionally **deviate from the No-Line rule** to match the source.
- **`ButtonGlyph`** - `filter: brightness(0)` so the neon-green `terminal` asset reads as a
  dark glyph on the green contained button.

## Typography

The headline is `text-6xl`/`text-8xl` (60/96px), beyond the `fontSizes` scale (max 48),
so it uses a raw responsive `fontSize={['3.75rem','3.75rem','6rem']}`. The green word is a
nested `Typography as="span"` with `fontSize="inherit"`.

## Usage

```tsx
import { AboutHero } from 'src/section/AboutHero'
;<AboutHero />
```
