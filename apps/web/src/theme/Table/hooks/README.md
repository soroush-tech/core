# Table hooks

Consumer-called hooks that own the state of interactive tables — sorting, pagination, and row
selection. Each returns **spreadable entries** whose property names match the component they wire
(`TableSortLabel`, `TablePagination`, `Checkbox`), and all three feed
[`TableControl`](../TableControl/README.md), which derives the visible rows. No context, no
component changes — every wire is explicit.

```tsx
const sort = useTableSort(['service', 'latency'])
const pagination = useTablePagination({ defaultRowsPerPage: 10 })
const selection = useTableSelection(services.map((s) => s.service))
```

## useTableSort

```ts
useTableSort<K extends string>(
  keys: readonly K[],
  onChange?: (key: K, direction: 'asc' | 'desc') => void
): Record<K, { isActive: boolean; direction: 'asc' | 'desc'; onClick: () => void }>
```

Column-keyed sort state. Each entry spreads directly onto `TableSortLabel`:

```tsx
<TableCell sortDirection={sort.service.isActive ? sort.service.direction : undefined}>
  <TableSortLabel {...sort.service}>Service</TableSortLabel>
</TableCell>
```

- Every column remembers its own direction (initially `'asc'`). Clicking a column activates it
  **and flips its stored direction** — the first click on a column sorts `'desc'`.
- `onChange(key, direction)` fires on every toggle (server-side sorting, analytics, page resets…).
- `keys` is read once on mount; entries are memoized with stable `onClick` identities.

## useTablePagination

```ts
useTablePagination(options?: { defaultPage?: number; defaultRowsPerPage?: number }): {
  page: number             // 0-based, default 0
  rowsPerPage: number      // default 10; -1 = all rows
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void  // resets page to 0
}
```

Property names mirror `TablePagination`'s props exactly:

```tsx
<TablePagination count={services.length} {...pagination} />
```

## useTableSelection

```ts
useTableSelection<K extends string | number>(
  keys: readonly K[],                     // all selectable identities
  onChange?: (selected: K[]) => void
): {
  selected: K[]
  isSelected: (key: K) => boolean
  all: { checked: boolean; indeterminate: boolean; onChange: () => void }  // header Checkbox
  row: (key: K) => { checked: boolean; onChange: () => void }              // row Checkbox
  clear: () => void
}
```

Key-based row selection that survives paging and re-sorting — selection is stored as row
identities, and select-all/indeterminate are computed against the full `keys` list, never the
visible slice:

```tsx
<Checkbox {...selection.all} aria-label="Select all deployments" />
…
<TableRow isSelected={selection.isSelected(row.service)}>
  <TableCell>
    <Checkbox {...selection.row(row.service)} aria-label={`Select ${row.service}`} />
  </TableCell>
  …
</TableRow>
…
{selection.selected.length} of {services.length} selected
```

- Select-all targets the **entire dataset**: checked when every key is selected, `indeterminate`
  when some-but-not-all, and clicking clears or selects all accordingly.
- Deliberately key-based (no `data`/row coupling) — the consumer already holds the key at every
  call site, and the hook doubles as a generic keyed-selection primitive.

## All together

The `RowSelection` story (`Theme/Table/Table`) shows the full kit — sortable headers, pagination,
and a checkbox column whose selection survives re-sorting and page flips:

```tsx
<TableControl data={deployments} sort={sort} pagination={pagination}>
  {(row) => (
    <TableRow key={row.service} isHoverable isSelected={selection.isSelected(row.service)}>
      …
    </TableRow>
  )}
</TableControl>
```
