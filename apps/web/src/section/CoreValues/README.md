# CoreValues

Core-values grid for the biography page. A header row (`CORE VALUES` heading +
`Foundational Operating Protocols` subtitle + `LOAD: CORE_SYSTEMS_06` readout)
above a responsive 1 → 2 → 3 column grid of six value cards, each with a neon icon,
title, and description.

## Props

None. The section renders static content.

## Composition

| Region       | Built from                                                |
| ------------ | --------------------------------------------------------- |
| Section root | `View as="section" bg="primary"`                          |
| Header       | `Flex` + `Typography` (`h2` / `overline` / `caption`)     |
| Header rule  | `View height="2px" bg="default"` (desktop only)           |
| Card grid    | `Grid` (`1fr` → 2 → 3 columns)                            |
| Card         | `Flex bg="secondary"` + `Image` icon + `Typography`       |
| Card title   | `Typography variant="h4" as="h3"` - h4 size, h3 semantics |

## Icons

`src/assets/icons/`: `psychology`, `settings_input_component`, `ads_click`,
`groups`, `visibility`, `speed` - Material Symbols (filled, `#9cff93`), rendered
decoratively (`alt=""`, `aria-hidden`).

## Notes

- Per the design system **No-Line rule**, cards are separated by a 1-unit grid gap
  that reveals the darker section background (`surface`), not by borders. The source
  HTML's `border-l` accents are dropped; the neon icons carry the green accent.
- Card titles use `as="h3"` to preserve heading order under the section's `h2`.

## Usage

```tsx
import { CoreValues } from 'src/section/CoreValues'
;<CoreValues />
```
