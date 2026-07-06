# TableFooter

The footer section of a `Table`. Renders `<tfoot>` and provides `TableSectionContext` = `'footer'`,
which makes descendant `TableCell`s render as `<td>`. The natural home for totals rows and
`TablePagination`.

```tsx
<Table>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

## Props

| Prop    | Type                        | Default   | Description                 |
| ------- | --------------------------- | --------- | --------------------------- |
| `color` | `keyof Theme['text']`       | —         | Text color.                 |
| `bg`    | `keyof Theme['background']` | —         | Background color.           |
| `as`    | `ElementType`               | `'tfoot'` | Overrides the root element. |

Also supports styled-system `space` and `border` props.
