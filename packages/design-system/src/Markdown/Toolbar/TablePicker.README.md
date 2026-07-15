# TablePicker

The **Table** toolbar control: a trigger button (table icon) that opens a `Popover` with a hover
grid for choosing table dimensions. Grid cells highlight the top-left rectangle under the cursor;
the grid **grows** toward the edge as you approach it (never shrinks while open) and resets to the
default 8×8 when closed.

Used inside `Toolbar`, which wires `onSelect` to a generated GFM table insert. It is standalone
(takes a callback), not context-bound.

## Props

| Prop       | Type                                   | Description                                       |
| ---------- | -------------------------------------- | ------------------------------------------------- |
| `onSelect` | `(rows: number, cols: number) => void` | Fired with the chosen dimensions on a cell click. |

```tsx
<TablePicker onSelect={(rows, cols) => insertTable(rows, cols)} />
```
