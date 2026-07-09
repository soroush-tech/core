# TableControl

Kills the sortable/paginated-table boilerplate: consumer-called hooks own the state
(`useTableSort`, `useTablePagination`, `useTableSelection`), and `TableControl` takes the `data`
plus the hook outputs and renders the visible rows inside `TableBody`. No context, no changes to
any other component — every wire is explicit and spreadable.

```tsx
const sort = useTableSort(['name', 'latency'])
const pagination = useTablePagination({ defaultRowsPerPage: 10 })

<Table size="sm">
  <TableHead>
    <TableRow>
      <TableCell sortDirection={sort.name.isActive ? sort.name.direction : undefined}>
        <TableSortLabel {...sort.name}>Service</TableSortLabel>
      </TableCell>
      <TableCell align="right" sortDirection={sort.latency.isActive ? sort.latency.direction : undefined}>
        <TableSortLabel {...sort.latency}>Latency (ms)</TableSortLabel>
      </TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableControl data={services} sort={sort} pagination={pagination}>
      {(row) => (
        <TableRow key={row.name} isHoverable>
          <TableCell>{row.name}</TableCell>
          <TableCell align="right">{row.latency}</TableCell>
        </TableRow>
      )}
    </TableControl>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TablePagination count={services.length} {...pagination} />
    </TableRow>
  </TableFooter>
</Table>
```

## The hooks

`useTableSort`, `useTablePagination`, and `useTableSelection` live in
[`src/theme/Table/hooks/`](../hooks/README.md) — see that README for their full APIs. In short:

- **`useTableSort(keys, onChange?)`** — column-keyed entries that spread onto `TableSortLabel`;
  per-column direction memory, always-flip toggle (first click sorts `'desc'`)
- **`useTablePagination({ defaultPage?, defaultRowsPerPage? })`** — mirrors `TablePagination`'s
  props for one-spread wiring; page-size change resets to page 0
- **`useTableSelection(keys, onChange?)`** — key-based selection that survives paging and
  re-sorting; `all`/`row(key)` entries spread onto `Checkbox`

## TableControl

| Prop           | Type                                   | Default  | Description                                                                                                                        |
| -------------- | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `data`         | `readonly T[]`                         | —        | The full dataset. **Required.**                                                                                                    |
| `sort`         | `TableSortMap`                         | —        | Sort map from `useTableSort` — the `isActive` entry drives the ordering.                                                           |
| `pagination`   | `{ page, rowsPerPage }`                | —        | Paging state from `useTablePagination` — drives the visible slice.                                                                 |
| `sortFunction` | `(a: T, b: T, orderBy: K) => number`   | built-in | Custom sort (ascending; the direction flips it). Receives the **active column key**, so different columns can use different logic. |
| `children`     | `(row: T, index: number) => ReactNode` | —        | Row renderer. **Required.**                                                                                                        |

- Default comparator handles strings and numbers; no active column → data order untouched.
- Per-column custom sorting — branch on the key `sortFunction` receives:

  ```tsx
  <TableControl
    data={services}
    sort={sort}
    sortFunction={(a, b, orderBy) =>
      orderBy === 'name' ? a.name.localeCompare(b.name) : a.latency - b.latency
    }
  >
  ```

- `rowsPerPage: -1` disables slicing; the page is clamped so a shrinking dataset never strands
  the view on an empty page.
- Renders the rows in a fragment — no wrapper element, so the output stays valid `<tr>` children
  of `<tbody>`. Both `sort` and `pagination` are optional (sort-only / paging-only tables work).
