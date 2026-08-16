# CurrentFocus

"Current Focus" status block: a `Status_Update` eyebrow + `Current Focus (Sabbatical)`
heading above three domain cards (AI Architecture, Intelligent Systems / RAG,
Next-Gen Full-Stack).

## Props

None. The section renders static content.

## Composition

| Region       | Built from                                               |
| ------------ | -------------------------------------------------------- |
| Section root | `View as="section" bg="terminal"`                        |
| Header       | `Flex` + `Typography` (`overline` + `h2` w/ nested span) |
| Card grid    | `Grid` (`1fr` → 3 columns)                               |
| Card         | `View bg="paper"` + `Image` icon + `Typography`          |
| Card title   | `Typography variant="h5" as="h3"`                        |

## Icons

`src/assets/icons/`: `neurology` (existing), `database`, `stacks` - Material Symbols
(filled, `#9cff93`), decorative (`alt=""`, `aria-hidden`).

## Notes

- Per the **No-Line rule**, the source card borders and the section `border-y` are
  dropped; cards are set off by their `surface-container-low` background against the
  `surface-container-lowest` section.
- The `(Sabbatical)` note is a nested `Typography as="span"` inside the `h2` so it
  stays part of the heading while reading as a muted italic aside.

## Usage

```tsx
import { CurrentFocus } from 'src/section/CurrentFocus'
;<CurrentFocus />
```
