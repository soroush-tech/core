# Backdrop

A dimmed, full-viewport scrim rendered behind a modal's content. Built on `View`, so it accepts every `View` prop (background, spacing, layout, event handlers, etc.).

Fixed to the viewport (`position: fixed; inset: 0`) and sits behind the modal content (`z-index: -1` relative to the modal root), so clicks on the empty area land on the backdrop rather than the content. Defaults to the theme `backdrop` background.

---

## Backdrop-specific defaults

| Property   | Value                           |
| ---------- | ------------------------------- |
| `bg`       | `"backdrop"` (theme.background) |
| `position` | `fixed`                         |
| `inset`    | `0`                             |
| `z-index`  | `-1`                            |

Override the colour with the `bg` prop (any `theme.background` token). All other [`View`](../View/README.md) props pass through.

---

## Example

```tsx
<Backdrop onClick={handleClose} />

// Custom tint
<Backdrop bg="modal" />
```
