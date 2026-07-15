# Table

The root of the table family. Renders a `<table>` with collapsed borders and full width, and
broadcasts cell config (`size`, `cellPadding`, `hasStickyHeader`) to descendant `TableCell`s via
`TableContext`.

```tsx
import { Table, TableHead, TableBody, TableRow, TableCell } from '@soroush.tech/design-system/Table'

;<Table size="sm" hasStickyHeader>
  <TableHead>…</TableHead>
  <TableBody>…</TableBody>
</Table>
```

## Props

| Prop                 | Type                                         | Default    | Description                                                                                                                                                                        |
| -------------------- | -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`               | `keyof Theme['sizes']`                       | `'md'`     | Cell density — broadcast to descendant `TableCell`s via `TableContext`.                                                                                                            |
| `cellPadding`        | `'normal' \| 'none'`                         | `'normal'` | Cell padding mode — `'none'` zeroes cell padding.                                                                                                                                  |
| `hasStickyHeader`    | `boolean`                                    | `false`    | Makes header cells stick to the top of a scrolling `TableContainer` (needs a bounded height).                                                                                      |
| `shouldHideSortIcon` | `boolean`                                    | `true`     | Hides inactive sort icons (revealed on hover/focus) — broadcast to `TableSortLabel`s via `TableContext`. Set `false` to keep them always visible (dimmed).                         |
| `hasEllipsis`        | `boolean`                                    | `false`    | Truncates overflowing cell text with an ellipsis — broadcast to `TableCell`s via `TableContext`. Cells need a constrained width for the truncation to kick in.                     |
| `align`              | `'left' \| 'right' \| 'center' \| 'justify'` | —          | Default text alignment for every cell — cells with `align="inherit"` (the default) follow it.                                                                                      |
| `color`              | `PaletteColor`                               | —          | Palette color for descendant rows' hover/selected shading — broadcast to `TableRow`s via `TableContext`; a row's own `color` wins.                                                 |
| `bg`                 | `keyof Theme['background']`                  | —          | Background color.                                                                                                                                                                  |
| `borderColor`        | `keyof Theme['border']`                      | `'light'`  | Border color for the frame **and every descendant border** (row dividers, custom cell/row borders) — a child's own `borderColor` overrides it; borderless children are unaffected. |
| `as`                 | `ElementType`                                | `'table'`  | Overrides the root element.                                                                                                                                                        |

Also supports styled-system `space`, `layout`, and `border` props. The table is framed with a
**thin solid `theme.border.light` border by default** — override it with `borderColor` /
`borderWidth` / `borderStyle`, or remove it with `borderStyle="none"`. Rows are separated by a
matching default divider carried by each `TableCell` (`borderBottom`) — see the TableCell README.

## Rounded corners

`border-collapse: collapse` (the default) defeats `border-radius`, so when `borderRadius` is set
the table automatically switches to the separate border model (`border-spacing: 0`) and clips its
corners with `overflow: hidden`. Note that in the separate model adjacent cell borders no longer
merge — prefer row-level bottom borders over full cell borders when rounding.

## Context

`Table` provides `TableContext` — `{ size, cellPadding, hasStickyHeader, shouldHideSortIcon,
hasEllipsis, color }` — consumed by `TableCell`, `TableSortLabel`, and `TableRow`. Per-component
props override the inherited values.
