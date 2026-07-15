# TablePaginationActions

The first / previous / next / last icon-button cluster used inside `TablePagination`, exported
separately for custom toolbars. Composes `PaginationItem`'s nav types; boundary state is derived
from `count` / `page` / `rowsPerPage`.

```tsx
<TablePaginationActions
  count={rows.length}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={setPage}
  getItemAriaLabel={(type) => `Go to ${type} page`}
/>
```

## Props

| Prop                                             | Type                     | Default | Description                                                       |
| ------------------------------------------------ | ------------------------ | ------- | ----------------------------------------------------------------- |
| `count` / `page` / `rowsPerPage`                 | `number`                 | —       | Pagination state used to derive boundary disabling. **Required.** |
| `onPageChange`                                   | `(page: number) => void` | —       | Fired with the target zero-based page. **Required.**              |
| `getItemAriaLabel`                               | `(type) => string`       | —       | Accessible name per button. **Required.**                         |
| `disabled`                                       | `boolean`                | `false` | Disables all buttons.                                             |
| `shouldShowFirstButton` / `shouldShowLastButton` | `boolean`                | `false` | Adds first/last buttons.                                          |
| `size`                                           | `keyof Theme['sizes']`   | `'sm'`  | Button density.                                                   |

Boundary rules: backward buttons disable on page 0; forward buttons disable on the last page
(`ceil(count / rowsPerPage) - 1`); with `count === -1` next stays enabled and last is disabled;
`rowsPerPage === -1` is a single page holding all rows.
