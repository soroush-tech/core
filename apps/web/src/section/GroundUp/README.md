# GroundUp

Centered "problem solving / ground up" statement for the biography page: an eyebrow
label, a large headline, a lead paragraph, and an `INITIATING_DX_PROTOCOL` status
pill, over a faint oversized decorative `01`.

## Props

None. The section renders static content.

## Composition

| Region          | Built from                                                              |
| --------------- | ----------------------------------------------------------------------- |
| Section root    | `View as="section" bg="terminal"` (relative, overflow hidden)           |
| Centered column | `LayoutFrame textAlign="center"` (z-index above decoration)             |
| Eyebrow         | `Typography variant="caption"` primary, widest tracking                 |
| Headline        | `Typography variant="h1"` black weight                                  |
| Lead paragraph  | `Typography body1` at `fontSize={3}` (20px)                             |
| Status pill     | `Flex display="inline-flex" bg="secondary"` + label + dots              |
| Loading dots    | three `View` (`0.25rem`, `borderRadius="9999px"`, `bg="primary"`)       |
| Decoration      | absolute `Typography fontSize="20rem"`, `opacity={0.05}`, `aria-hidden` |

## Notes

- Per the **No-Line rule**, the pill's `border-y` is dropped; it is defined by its
  `surface-container` background against the `surface-container-lowest` section.
- The source's bouncing-dot animation is rendered **static** (no `keyframes`).
- The decorative `01` is `aria-hidden` so it does not pollute the accessibility tree.

## Usage

```tsx
import { GroundUp } from 'src/section/GroundUp'
;<GroundUp />
```
