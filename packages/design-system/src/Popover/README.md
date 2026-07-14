# Popover

Positions floating content next to an anchor, portaled above the page. It is built on
[`Modal`](../Modal/README.md), so it inherits the portal, optional backdrop, focus management,
scroll lock, and Escape / click-away close — then adds anchor positioning
(`anchorOrigin` / `transformOrigin` / `marginThreshold`).

```tsx
import { useState } from 'react'
import { Popover } from '@soroush.tech/design-system/Popover'
import { Button } from '@soroush.tech/design-system/Button'

function Example() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button onClick={(event) => setAnchor(event.currentTarget)}>Open</Button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <p>Popover content</p>
      </Popover>
    </>
  )
}
```

## Props

| Prop                                                                                | Type                                                 | Default                                   | Description                                                                                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `open`                                                                              | `boolean`                                            | —                                         | If true, the popover is shown. **Required.**                                                   |
| `children`                                                                          | `ReactNode`                                          | —                                         | The content of the popover.                                                                    |
| `anchorEl`                                                                          | `HTMLElement \| (() => HTMLElement \| null) \| null` | —                                         | Element (or getter) the popover is positioned against.                                         |
| `anchorReference`                                                                   | `'anchorEl' \| 'anchorPosition' \| 'none'`           | `'anchorEl'`                              | Which anchor to position against.                                                              |
| `anchorPosition`                                                                    | `{ top: number; left: number }`                      | —                                         | Client coordinates used when `anchorReference` is `'anchorPosition'`.                          |
| `anchorOrigin`                                                                      | `{ vertical, horizontal }`                           | `{ vertical: 'top', horizontal: 'left' }` | Point on the anchor the popover attaches to. Keywords or px numbers.                           |
| `transformOrigin`                                                                   | `{ vertical, horizontal }`                           | `{ vertical: 'top', horizontal: 'left' }` | Point on the popover that meets the anchor.                                                    |
| `onClose`                                                                           | `(event, reason) => void`                            | —                                         | Fired on Escape or a click outside the surface (`reason` from `Modal`).                        |
| `elevation`                                                                         | `PaperElevation` (0–24)                              | `8`                                       | Shadow depth of the surface.                                                                   |
| `marginThreshold`                                                                   | `keyof Theme['space'] \| null`                       | `2` (→ 16px)                              | Minimum gap from the viewport edge, as a spacing token; `null` disables clamping/flipping.     |
| `container`                                                                         | `HTMLElement \| (() => HTMLElement \| null) \| null` | —                                         | Portal target passed to `Modal`.                                                               |
| `action`                                                                            | `Ref<PopoverActions>`                                | —                                         | Imperative handle exposing `updatePosition()`.                                                 |
| `slotProps`                                                                         | `{ paper?: PaperProps }`                             | —                                         | Props for the paper slot (surface) — e.g. `bg`, `p`, `style`.                                  |
| `hasBackdrop`                                                                       | `boolean`                                            | `false`                                   | Render a dimmed backdrop. Off by default (invisible click-away via Modal root).                |
| `disableScrollLock`                                                                 | `boolean`                                            | `false`                                   | Disable body scroll-lock; when true the popover re-positions on scroll.                        |
| `disableAriaHidden`                                                                 | `boolean`                                            | `false`                                   | Skip `aria-hidden` on background content for non-modal (`aria-activedescendant`) popovers.     |
| `shouldAutoFocus` / `shouldTrapFocus` / `shouldEnforceFocus` / `shouldRestoreFocus` | `boolean`                                            | `true`                                    | Focus-management flags forwarded to `Modal`. Set `false` for `aria-activedescendant` patterns. |
| `shouldKeepMounted`                                                                 | `boolean`                                            | `false`                                   | Keep the content mounted while closed.                                                         |
| `layer`                                                                             | `keyof Theme['zOrder']`                              | `'modal'`                                 | Stacking layer.                                                                                |

## Notes

- Positioning is a pure function (`utils/computePopoverPosition`): it places the paper so its
  `transformOrigin` meets the anchor's `anchorOrigin`, **flips to the opposite side** when the
  preferred side would overflow the viewport (e.g. opens above the anchor near the bottom edge),
  and clamps within `marginThreshold` as a fallback. This makes the geometry fully unit-testable.
- The surface is hidden (opacity 0) until first positioned, so it never flashes at the wrong spot.
- Consumers that keep focus on the trigger (e.g. `Select`'s `aria-activedescendant` listbox) should
  pass the four `should*Focus` flags as `false`.
