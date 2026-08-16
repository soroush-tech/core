# CorePhilosophy

Homepage section presenting the core engineering philosophy as a three-card bento grid.

## Props

No public props. This is a static section with fixed content.

## Usage

```tsx
import { CorePhilosophy } from 'src/section/CorePhilosophy'
;<CorePhilosophy />
```

## Content

- Eyebrow: `// CORE_PHILOSOPHY`
- Heading: "ARCHITECTURAL DECISIONS & AI INTEGRATION"
- Three pillars, each an icon + title + description:
  - `account_tree` - System Scalability
  - `neurology` - LLM Synergy
  - `schema` - Atomic Design

## Notes

- Section background `terminal`; cards `paper` with a `light` border (`borderColor`/
  `borderWidth`/`borderStyle` props on `Paper`).
- `PhilosophyCard` is a `styled(Paper)` only to add a `:hover` background change to
  `background.secondary` - styled-system has no hover prop. The border and transition use
  Paper's own token props.
- Icons are imported as React components via SVGR (`*.svg?react`) so `fill="currentColor"`
  resolves to a CSS color. Each icon is wrapped in a `Typography color="primary"` span, which
  drives the green accent (`theme.text.primary`) - theme-aware across light/dark. The three
  icons (`account_tree`/`neurology`/`schema`) use `fill="currentColor"` and are exclusive to
  this section.
- Typography mapping: heading `h2` (32px) · card title `h4` (20px, uppercase) ·
  description `body2` (14px) · eyebrow `overline`.
