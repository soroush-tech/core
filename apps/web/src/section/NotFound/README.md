# NotFound

The 404 / error section — a centered card with a glitched `404` hero and a recovery link.
Rendered by the Vike error page (`src/pages/_error/+Page.tsx`), which Vike pre-renders
to `build/client/404.html` so GitHub Pages can serve it for any unmatched deep link.

## Props

No public props. Static content.

## Layout

- A `bracketBox` `Card`, centered both axes in the content area (`section` is a centering
  flex that fills `Layout`'s `main`), with a flickering `warning` glyph in its top-left corner.
- A `404` glitch hero plus a secondary glitch heading. The secondary heading is sized at a
  constant `5/16` of the `404` clamp so the two stay in proportion across the viewport.
- A recovery `Button` (wrapped in `Flicker`) linking to `/`.

Rendered inside the standard `Layout` (header, footer, blueprint backdrop) like every
other page — the grid, scanline, and cursor spotlight come from `Layout`'s `Blueprint`.

## Animations

| Effect                    | Mechanism                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| RGB-split glitch headings | `GlitchText` keyframes; the second heading uses `inverted` so it doesn't jitter in lock-step with the `404`. |
| Flicker                   | `Flicker` keyframes pulse the corner `warning` glyph and the recovery button.                                |

## Usage

```tsx
import { NotFound } from 'src/section/NotFound'
;<NotFound />
```

## Testing

- Unit (`NotFound.test.tsx`): section element, `404` hero, secondary heading, and the home link.
- The 404 route itself is covered by the page e2e spec (`src/pages/_error/_error.e2e.ts`).
