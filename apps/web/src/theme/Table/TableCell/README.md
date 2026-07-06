# TableCell

A cell in a table. Renders `<th scope="col">` inside a `TableHead` and `<td>` elsewhere — driven
by `TableSectionContext` — and inherits `size` / `cellPadding` from the enclosing `Table` via
`TableContext`. Explicit props override both contexts.

```tsx
<TableHead>
  <TableRow>
    <TableCell sortDirection="asc">Name</TableCell> {/* <th scope="col" aria-sort="ascending"> */}
    <TableCell align="right">Amount</TableCell>
  </TableRow>
</TableHead>
```

## Props

| Prop            | Type                                                      | Default           | Description                                                                                                                                                                               |
| --------------- | --------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`       | `'head' \| 'body' \| 'footer'`                            | _inherited_       | Cell type — overrides the enclosing section. `head` renders `<th scope="col">`.                                                                                                           |
| `align`         | `'inherit' \| 'left' \| 'right' \| 'center' \| 'justify'` | `'inherit'`       | Text alignment. `inherit` follows the `Table`'s `align` and neutralises the browser's default `<th>` centering, so header and body cells align the same. Numbers should be right-aligned. |
| `size`          | `keyof Theme['sizes']`                                    | _inherited_       | Cell density (padding + font size) — overrides the `Table`'s `size`.                                                                                                                      |
| `cellPadding`   | `'normal' \| 'none'`                                      | _inherited_       | Padding mode — overrides the `Table`'s `cellPadding`. `'none'` zeroes padding.                                                                                                            |
| `sortDirection` | `'asc' \| 'desc'`                                         | —                 | Sets `aria-sort` (`ascending`/`descending`) — pair with `TableSortLabel` for the control.                                                                                                 |
| `hasEllipsis`   | `boolean`                                                 | _inherited_       | Truncates overflowing text with an ellipsis (`overflow: hidden` + `nowrap`). Inherits the `Table`'s `hasEllipsis`; needs a constrained width (e.g. `maxWidth`) to kick in.                |
| `scope`         | `string`                                                  | `'col'` on `<th>` | Native scope attribute — required for screen-reader table navigation.                                                                                                                     |
| `color`         | `keyof Theme['text']`                                     | —                 | Text color.                                                                                                                                                                               |
| `bg`            | `keyof Theme['background']`                               | —                 | Background color.                                                                                                                                                                         |
| `as`            | `ElementType`                                             | _computed_        | Overrides the resolved `th`/`td` element.                                                                                                                                                 |

Also supports styled-system `space`, `typography`, and `border` props.

## Row dividers

Every cell carries a default bottom border (`thin solid`) so rows are visually separated out of
the box — it lives on the cell (not the row) because `<tr>` borders don't render in the separate
border model used by rounded tables. Its **color cascades from the enclosing `Table`'s
`borderColor`** (default `light`); a cell's own `borderColor` overrides it, and `borderBottom="none"`
removes the divider entirely.

## Sticky headers

When the enclosing `Table` sets `hasStickyHeader`, header cells get `position: sticky; top: 0`
plus an opaque default background (`theme.background.paper`) so scrolled rows don't bleed through
— override it with the `bg` prop. Wrap the table in a `TableContainer` with a bounded height to
see the effect.
