# CoreEngine

Homepage section listing the core technology stack as a grid of square icon tiles.

## Props

No public props. This is a static section with fixed content.

## Usage

```tsx
import { CoreEngine } from 'src/section/CoreEngine'
;<CoreEngine />
```

## Content

- Eyebrow: `MODERN_TOOLING_ARRAY`
- Heading: "CORE ENGINE SPECIFICATIONS"
- Six square tiles, each an icon + label:
  - `code` - TypeScript
  - `rebase_edit` - React / Next
  - `smartphone` - React Native
  - `dns` - Node.js
  - `cloud_done` - AWS / GCP
  - `terminal` - Rust / WASM

## Notes

- Layout: 2 → 4 → 6 column responsive grid. Tiles are square via `Paper`'s `aspectRatio={1}`.
- `HairlineGrid` is a `styled(Grid)` that sets `gap` to the `thin` border-width token (1px,
  which has no space-scale equivalent) over a `border.light` background, so the gaps render
  as single hairlines between tiles.
- `EngineTile` is a `styled(Paper)` only to add a `:hover` background change to
  `background.paper` - styled-system has no hover prop.
- Icons are white-fill SVGs rendered via `Image` (`aria-hidden`); the mockup's muted/green
  icon tint and hover-recolor are not applied (would require a CSS filter on an `<img>`).
- Typography mapping: heading `h1` (48px, black) · tile label `caption` (12px, uppercase) ·
  eyebrow `overline`.
