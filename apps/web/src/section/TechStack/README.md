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

- Layout: the theme layout grid (`Grid layout`) - tiles take 1 → 2 → 4 across (`span` 4 of 4,
  4 of 8, 3 of 12). The title card and AI card each take two tiles' width from `md`
  (`span` 6 of 12).
- `AIHighlightCard` uses `background: linear-gradient()` - no styled-system equivalent.
- Language skill levels: `Expert` / `Legacy` use `color="primary"` (green accent);
  `Mid` uses `color="secondary"` (muted).
