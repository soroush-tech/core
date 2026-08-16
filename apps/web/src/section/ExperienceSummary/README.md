# ExperienceSummary

Two-column experience block: a professional summary (copy + open-source note +
`18+` / `100%` stats) beside a "Technical Stack Matrix" panel of skill groups with
proficiency bars.

## Props

None. The section renders static content.

## Composition

| Region           | Built from                                                |
| ---------------- | --------------------------------------------------------- |
| Section root     | `View as="section" bg="primary"`                          |
| Column grid      | `Grid` (`1fr` → two columns), `alignItems="start"`        |
| Summary copy     | `Typography body1` with nested bold `as="span"` emphasis  |
| Open-source note | `View bg="grid"` + italic `Typography` (handle in green)  |
| Stats            | `Grid` of `Typography` (`h3 as p`, green value) + caption |
| Matrix panel     | `View bg="terminal"` with header + skill rows             |
| Matrix heading   | `Typography variant="caption" as="h3"`                    |
| Skill bar        | `View role="progressbar"` track + `styled` `ProgressFill` |

## Accessibility

- Each skill bar is a `role="progressbar"` with `aria-valuenow/min/max` and an
  `aria-label` (e.g. `"Frontend & Mobile Architecture proficiency: Advanced"`).
- The decorative status-dot cluster is `aria-hidden`.

## Notes

- Per the **No-Line rule**, all source borders (card border, header `border-b`, tag
  borders, the open-source `border-l-2`) are dropped; separation comes from background
  tiers (`terminal` panel, `surface-container` tags, `grid`-tinted open-source note).
- The neon bar fill uses `palette.primary.main` via `styled` (not in the `background`
  scale) - same documented exception as `Eyebrow`. The `bg-primary/5` open-source tint
  maps to the `background.grid` token.

## Usage

```tsx
import { ExperienceSummary } from 'src/section/ExperienceSummary'
;<ExperienceSummary />
```
