# PaginationItem

The individual item rendered inside `Pagination`. Its `type` determines what it renders: a page
number button, a first/previous/next/last nav control (with the matching registry icon), or a
non-interactive ellipsis.

```tsx
<PaginationItem page={3} isSelected />
<PaginationItem type="next" onClick={goNext} />
<PaginationItem type="start-ellipsis" />
```

## Props

| Prop         | Type                                                                                        | Default      | Description                                                     |
| ------------ | ------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------- |
| `type`       | `'page' \| 'first' \| 'previous' \| 'next' \| 'last' \| 'start-ellipsis' \| 'end-ellipsis'` | `'page'`     | What the item renders. Ellipses render as a span, not a button. |
| `page`       | `ReactNode`                                                                                 | —            | The page number/content for `type="page"`.                      |
| `isSelected` | `boolean`                                                                                   | `false`      | Active styling + `aria-current="page"`.                         |
| `color`      | `keyof Theme['palette']`                                                                    | `'primary'`  | Selected-state color.                                           |
| `variant`    | `'text' \| 'outlined'`                                                                      | `'text'`     | Item style.                                                     |
| `shape`      | `'circular' \| 'rounded'`                                                                   | `'circular'` | Corner shape — circular pill or `theme.radii.md`.               |
| `size`       | `keyof Theme['sizes']`                                                                      | `'md'`       | Item dimensions and font size.                                  |
| `disabled`   | `boolean`                                                                                   | `false`      | Disables the item.                                              |
| `as`         | `ElementType`                                                                               | `'button'`   | Overrides the root element (e.g. `'a'` for router links).       |

Native button attributes (`onClick`, `aria-label`, …) and `space` props pass through. Nav icons
come from the Icon registry: `first_page`, `chevron_left`, `chevron_right`, `last_page`.
