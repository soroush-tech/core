# Drawer

A panel that slides in from a screen edge, built on [`Modal`](../Modal/README.md). It portals, dims the page with a backdrop, traps focus, locks body scroll, and closes on Escape (top modal only) or backdrop click — all inherited from Modal. The panel itself is a [`Paper`](../Paper/README.md), anchored to the chosen edge and animated with a per-anchor slide that respects `prefers-reduced-motion`. It renders on the `theme.zOrder.drawer` layer — above the app bar, below modals.

This is the temporary/overlay drawer only (no permanent docking). The first consumer is the mobile navigation menu.

---

## Props

| Prop                 | Type                                                      | Default  | Description                                         |
| -------------------- | --------------------------------------------------------- | -------- | --------------------------------------------------- |
| `isOpen`             | `boolean`                                                 | —        | If true, the drawer is shown.                       |
| `children`           | `ReactNode`                                               | —        | The drawer content.                                 |
| `onClose`            | `(event, reason: 'escapeKey' \| 'backdropClick') => void` | —        | Fired on Escape (top modal only) or backdrop click. |
| `anchor`             | `'left' \| 'right' \| 'top' \| 'bottom'`                  | `'left'` | Edge the drawer slides in from.                     |
| `elevation`          | `0–24`                                                    | `16`     | Shadow depth of the panel, forwarded to `Paper`.    |
| `transitionDuration` | `number`                                                  | `225`    | Slide duration in milliseconds.                     |

Also accepts every other `Modal` pass-through control — e.g. `hasBackdrop`, `shouldKeepMounted`, `shouldUsePortal`, `portalContainer`, `shouldLockScroll`, `shouldAutoFocus`, `shouldTrapFocus`, `shouldEnforceFocus`, `shouldRestoreFocus` — via `...modalProps`.

`left` / `right` anchors fill the viewport height; `top` / `bottom` fill the width. The panel's cross-axis size is driven by its content.

---

## Example

```tsx
const [isOpen, setIsOpen] = useState(false)

<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} anchor="right">
  <Navbar items={NAV_ITEMS} direction="vertical" gap={3} />
</Drawer>
```
