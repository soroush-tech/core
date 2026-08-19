# DeliveryDomains

"Delivery Domains" block: a heading + tagline label above three
platform cards (Web / Mobile / Desktop), followed by a centred "Centralized Logic Hub"
diagram block.

## Props

None. The section renders static content.

## Composition

| Region       | Built from                                                |
| ------------ | --------------------------------------------------------- |
| Section root | `View as="section" bg="paper"`                            |
| Header       | `Flex` + `Typography` (`h2` + italic tagline + `caption`) |
| Card grid    | `Grid` (`1fr` → 3 columns), 1-unit gap                    |
| Card         | `Flex bg="primary"` + `Image` icon + `Typography` ×3      |
| Card title   | `Typography variant="h5" as="h3"`                         |
| Hub block    | `Flex bg="default"` centring a `View bg="terminal"` node  |

## Icons

`src/assets/icons/`: `language`, `smartphone` (existing), `desktop_windows` - Material
Symbols (filled, `#9cff93`), decorative (`alt=""`, `aria-hidden`).

## Notes

- Per the **No-Line rule**, all source borders are dropped: cards sit on `surface`
  with the grid gap revealing the `surface-container-low` section between them; the
  `ARCHITECTURE_V4_LTS` label loses its `border-l`; and the hub "node" is rendered as a
  filled `surface-container-lowest` box (instead of a green-bordered, glowing box) so it
  stands out by background contrast on the `surface-container-highest` hub block.
- The hub label is `Typography ... as="p"` (not a heading) - it is a diagram node, not
  part of the document outline; card titles use `as="h3"` under the section `h2`.

## Usage

```tsx
import { DeliveryDomains } from 'src/section/DeliveryDomains'
;<DeliveryDomains />
```
