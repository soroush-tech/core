# Pagination

Page-number navigation for paging a list of arbitrary items (e.g. a blog index), with ellipsis
ranges and optional first/last/prev/next controls. Renders a `role="navigation"` landmark whose
items are `PaginationItem`s computed by the headless `usePagination` hook.

Pages are **1-based** — unlike `TablePagination` (0-based, table footer, rows-per-page selector).
Prefer `Pagination` where SEO/URLs matter.

```tsx
import { Pagination } from 'src/theme/Pagination'

;<Pagination count={10} page={page} onChange={setPage} />
```

## Props

| Prop                                             | Type                                 | Default                   | Description                                                      |
| ------------------------------------------------ | ------------------------------------ | ------------------------- | ---------------------------------------------------------------- |
| `count`                                          | `number`                             | —                         | Total number of pages. **Required.**                             |
| `page`                                           | `number`                             | —                         | Controlled current page (1-based).                               |
| `defaultPage`                                    | `number`                             | `1`                       | Uncontrolled initial page.                                       |
| `onChange`                                       | `(page: number) => void`             | —                         | Fired with the target page.                                      |
| `siblingCount`                                   | `number`                             | `1`                       | Pages always visible either side of the current page.            |
| `boundaryCount`                                  | `number`                             | `1`                       | Pages always visible at the start and end.                       |
| `color`                                          | `keyof Theme['palette']`             | `'primary'`               | Selected-item color.                                             |
| `variant`                                        | `'text' \| 'outlined'`               | `'text'`                  | Item style.                                                      |
| `shape`                                          | `'circular' \| 'rounded'`            | `'circular'`              | Item corner shape.                                               |
| `size`                                           | `keyof Theme['sizes']`               | `'md'`                    | Item density.                                                    |
| `disabled`                                       | `boolean`                            | `false`                   | Disables every item.                                             |
| `shouldShowFirstButton` / `shouldShowLastButton` | `boolean`                            | `false`                   | Adds first/last-page buttons.                                    |
| `shouldHidePrevButton` / `shouldHideNextButton`  | `boolean`                            | `false`                   | Removes the previous/next buttons.                               |
| `getItemAriaLabel`                               | `(type, page, isSelected) => string` | built-in                  | Accessible name per item ("Go to page 3", "Go to next page", …). |
| `aria-label`                                     | `string`                             | `'pagination navigation'` | Landmark label.                                                  |

## usePagination

The headless model is exported for custom renderings:

```tsx
import { usePagination } from 'src/theme/Pagination'

const { items } = usePagination({ count: 10, onChange })
// items: [{ type: 'previous', page, isSelected, isDisabled, onClick }, { type: 'page', … }, …]
```

## Accessibility

- Root landmark `role="navigation"` + `aria-label`.
- Every actionable item has an accessible name via `getItemAriaLabel`; the current page carries
  `aria-current="page"`.
- Ellipses render as non-interactive, `aria-hidden` list items.
