# Portal

Renders its children into a DOM node outside the parent component hierarchy — the document body by default. Used by overlay components (Modal, Drawer) so their content escapes ancestor `overflow`/`transform`/stacking contexts.

Resolution is synchronous during render, so the portaled content mounts in the same commit as the `<Portal>` — consumers can rely on their root ref being attached before their effects run. On the server (no `document`) it renders nothing.

---

## Props

| Prop        | Type                                                 | Default         | Description                                                              |
| ----------- | ---------------------------------------------------- | --------------- | ------------------------------------------------------------------------ |
| `children`  | `ReactNode`                                          | —               | Content rendered into the container.                                     |
| `container` | `HTMLElement \| (() => HTMLElement \| null) \| null` | `document.body` | Target node, or a function returning one. Falls back to `document.body`. |

---

## Example

```tsx
<Portal>
  <Toast>Saved</Toast>
</Portal>

// Into an explicit node
<Portal container={() => document.getElementById('overlays')}>
  <Dialog />
</Portal>
```
