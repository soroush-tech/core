# CallToAction

Homepage CTA section with a large decorative background word, headline, body copy,
and two action buttons.

## Props

No public props. This is a static section with fixed content.

## Usage

```tsx
import { CallToAction } from 'src/section/CallToAction'
;<CallToAction />
```

## Notes

- `DecorativeText` uses `font-size: 20vw` (viewport unit - no theme token) and
  `pointer-events: none` / `user-select: none` (no styled-system equivalents).
- The decorative element is wrapped in `aria-hidden="true"` and `opacity={0.05}`.
- The content wrapper uses `position="relative" zIndex={1}` to appear above the
  absolute-positioned decorative layer.
- Button labels preserve the terminal underscore style (`Connect Now`, `Schedule Call`).
