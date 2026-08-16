# TechStack

Homepage bento-grid section listing languages, frameworks, deployment tools, QA tools,
and an AI specialisation highlight.

## Props

No public props. This is a static section with fixed content.

## Usage

```tsx
import { TechStack } from 'src/section/TechStack'
;<TechStack />
```

## Notes

- Layout: 1 → 2 → 4 column responsive grid. Title card and AI card each span 2 columns
  on large screens via `grid-column: span 2` in their styled components (`BentoSpan`,
  `AIHighlightCard`). This requires a styled component because View has no `gridColumn` prop.
- `AIHighlightCard` uses `background: linear-gradient()` - no styled-system equivalent.
- Language skill levels: `Expert` / `Legacy` use `color="primary"` (green accent);
  `Mid` uses `color="secondary"` (muted).
