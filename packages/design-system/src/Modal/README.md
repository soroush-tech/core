# Modal

A low-level, accessible overlay primitive. Portals its content, dims the page with a `Backdrop`, traps focus, locks body scroll, and closes on Escape (top modal only) or backdrop click. Higher-level overlays — such as `Drawer` — are built on top of it.

Stacking, scroll-lock (with scrollbar-width compensation), and background `aria-hidden` are coordinated by a shared modal manager, so multiple overlays behave correctly. The root layers at `theme.zOrder.modal` by default, configurable via the `layer` prop (e.g. `Drawer` renders on the lower `drawer` layer).

---

## Props

| Prop                 | Type                                                      | Default | Description                                         |
| -------------------- | --------------------------------------------------------- | ------- | --------------------------------------------------- |
| `isOpen`             | `boolean`                                                 | —       | If true, the modal is shown.                        |
| `children`           | `ReactNode`                                               | —       | A single content element.                           |
| `onClose`            | `(event, reason: 'escapeKey' \| 'backdropClick') => void` | —       | Fired on Escape (top modal only) or backdrop click. |
| `hasBackdrop`        | `boolean`                                                 | `true`  | Render the dimmed backdrop.                         |
| `shouldKeepMounted`  | `boolean`                                                 | `false` | Keep children mounted while closed.                 |
| `shouldUsePortal`    | `boolean`                                                 | `true`  | Portal the modal into `portalContainer`.            |
| `portalContainer`    | `HTMLElement \| (() => HTMLElement \| null) \| null`      | body    | Portal target, or a function returning one.         |
| `shouldLockScroll`   | `boolean`                                                 | `true`  | Lock body scroll while open.                        |
| `shouldAutoFocus`    | `boolean`                                                 | `true`  | Move focus into the modal on open.                  |
| `shouldTrapFocus`    | `boolean`                                                 | `true`  | Trap `Tab` focus within the modal.                  |
| `shouldEnforceFocus` | `boolean`                                                 | `true`  | Pull focus back into the modal whenever it escapes. |
| `shouldRestoreFocus` | `boolean`                                                 | `true`  | Restore focus to the trigger on close.              |
| `scroll`             | `'paper' \| 'body'`                                       | `paper` | Where long content scrolls. See below.              |
| `layer`              | `'appBar' \| 'drawer' \| 'modal'`                         | `modal` | Stacking layer, resolved from `theme.zOrder`.       |

The content element should carry its own dialog semantics (`role="dialog"`, `aria-modal`, a label). Modal's root is `role="presentation"`.

---

## Scrolling long content

When content is too tall for the viewport, `scroll` controls where it scrolls:

- **`scroll="paper"`** (default) — the root centres the content and it scrolls _within_ the surface. Give your `Paper` a `maxHeight` and `overflow="auto"`.
- **`scroll="body"`** — the root itself is the scroll container. The surface keeps its natural height and the whole root (surface plus backdrop) scrolls. Short content is centred; tall content scrolls instead of clipping. Don't cap the surface height — use a margin for breathing room.

---

## Example

```tsx
const [isOpen, setIsOpen] = useState(false)

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <Paper role="dialog" aria-modal="true" aria-label="Settings" p={4}>
    <Typography variant="h5">Settings</Typography>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </Paper>
</Modal>
```
