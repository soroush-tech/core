# FocusTrap

Keeps keyboard focus within its children while active. On activation it moves focus inside, cycles `Tab` / `Shift+Tab` at the boundaries, pulls focus back when it escapes, and restores focus to the previously focused element on deactivation. Used by Modal to make overlays keyboard-accessible.

Renders a focus-scope wrapper `<div tabIndex={-1}>` around its children; when there are no focusable descendants, the wrapper itself receives focus.

---

## Props

| Prop                 | Type        | Default | Description                                                                 |
| -------------------- | ----------- | ------- | --------------------------------------------------------------------------- |
| `children`           | `ReactNode` | —       | Content whose focusable descendants are trapped.                            |
| `isEnabled`          | `boolean`   | `true`  | When false, focus is neither moved nor trapped (e.g. a non-top modal).      |
| `shouldAutoFocus`    | `boolean`   | `true`  | Move focus into the trap when it activates.                                 |
| `shouldTrapFocus`    | `boolean`   | `true`  | Keep `Tab` / `Shift+Tab` cycling within the trap.                           |
| `shouldEnforceFocus` | `boolean`   | `true`  | Pull focus back inside whenever it escapes the trap (e.g. a click outside). |
| `shouldRestoreFocus` | `boolean`   | `true`  | Restore focus to the previously focused element when the trap deactivates.  |

---

## Example

```tsx
<FocusTrap isEnabled={isOpen}>
  <div role="dialog" aria-modal="true">
    <button>Confirm</button>
    <button>Cancel</button>
  </div>
</FocusTrap>
```
