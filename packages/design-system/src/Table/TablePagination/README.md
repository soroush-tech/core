# TablePagination

A `TableCell`-based pagination control for placing inside `TableFooter > TableRow` — a
rows-per-page `NativeSelect`, a displayed-rows range label, and the nav button cluster
(`TablePaginationActions`). **Controlled only**: the consumer owns `page` and `rowsPerPage`.

Pages are **zero-based** (array-friendly), unlike the standalone `Pagination` (1-based, URL-friendly).

```tsx
<TableFooter>
  <TableRow>
    <TablePagination
      count={rows.length}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={setRowsPerPage}
    />
  </TableRow>
</TableFooter>
```

## Props

| Prop                                             | Type                                                | Default             | Description                                                           |
| ------------------------------------------------ | --------------------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| `count`                                          | `number`                                            | —                   | Total rows; `-1` = unknown (server-side). **Required.**               |
| `page`                                           | `number`                                            | —                   | Zero-based current page. **Required.**                                |
| `rowsPerPage`                                    | `number`                                            | —                   | Rows per page; `-1` shows all rows. **Required.**                     |
| `onPageChange`                                   | `(page: number) => void`                            | —                   | Fired with the target zero-based page. **Required.**                  |
| `onRowsPerPageChange`                            | `(rowsPerPage: number) => void`                     | —                   | Fired with the new rows-per-page value.                               |
| `rowsPerPageOptions`                             | `Array<number \| { label: string; value: number }>` | `[10, 25, 50, 100]` | Selector options; fewer than two hides the selector. `-1` = all rows. |
| `disabled`                                       | `boolean`                                           | `false`             | Disables all controls.                                                |
| `shouldShowFirstButton` / `shouldShowLastButton` | `boolean`                                           | `false`             | Adds first/last-page buttons.                                         |
| `rowsPerPageLabel`                               | `ReactNode`                                         | `'Rows per page:'`  | Selector label.                                                       |
| `displayedRowsLabel`                             | `({ from, to, count, page }) => ReactNode`          | `1–10 of 57`        | Range label; unknown count renders `more than {to}`.                  |
| `getItemAriaLabel`                               | `(type) => string`                                  | `Go to {type} page` | Accessible names for the nav buttons.                                 |
| `colSpan`                                        | `number`                                            | `1000`              | Spans the footer row.                                                 |
| `as`                                             | `ElementType`                                       | `'td'`              | Overrides the root element (via `TableCell`).                         |

Also accepts `TableCell` styling props (`size`, `cellPadding`, `color`, `bg`, spacing, border).

## TablePaginationActions

The first/previous/next/last icon-button cluster, exported separately for custom toolbars.
See [`TablePaginationActions/README.md`](../TablePaginationActions/README.md) for its props and boundary rules.
