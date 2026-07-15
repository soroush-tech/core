# TableSortLabel

A button-based label for sortable column headers, placed inside a header `TableCell`. Renders the
column label with a directional sort arrow appended; sort state is owned by the consumer — the
component renders the control and forwards `onClick`.

Pair it with `TableCell`'s `sortDirection` prop so screen readers get `aria-sort` on the cell.

```tsx
<TableCell sortDirection={isSorted ? direction : undefined}>
  <TableSortLabel isActive={isSorted} direction={direction} onClick={() => handleSort('name')}>
    Name
  </TableSortLabel>
</TableCell>
```

## Props

| Prop                 | Type                      | Default              | Description                                                                                                                                                                                         |
| -------------------- | ------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isActive`           | `boolean`                 | `false`              | Marks the currently-sorted column — shows the icon fully opaque.                                                                                                                                    |
| `direction`          | `'asc' \| 'desc'`         | `'asc'`              | Current sort direction — `desc` rotates the arrow 180°.                                                                                                                                             |
| `shouldHideSortIcon` | `boolean`                 | `true` _(inherited)_ | Hides the inactive sort icon, revealing it on hover/focus. Set `false` to keep it always visible (dimmed). Inherited from the enclosing `Table` via `TableContext`; the explicit prop overrides it. |
| `iconName`           | `IconName`                | `'arrow_upward'`     | Sort arrow icon from the Icon registry.                                                                                                                                                             |
| `iconProps`          | `Omit<IconProps, 'name'>` | —                    | Extra props for the sort arrow icon.                                                                                                                                                                |
| `children`           | `ReactNode`               | —                    | Label contents — the arrow is appended automatically.                                                                                                                                               |

Native button attributes (`onClick`, `aria-label`, `disabled`, …) and `space` props pass through.
`type` defaults to `'button'` so it never submits a form.

## Notes

- Implemented as a lean inline button that inherits the cell's typography **and color** — the
  active column keeps the header's color; the sort icon alone signals the state.
- By default the inactive icon is hidden and revealed (dimmed) on hover or keyboard focus; the
  active column's icon is always fully opaque. Set `shouldHideSortIcon={false}` — per label or
  once on the `Table` — to keep inactive icons permanently visible (dimmed).
