# TableHead

The header section of a `Table`. Renders `<thead>` and provides `TableSectionContext` = `'head'`,
which makes descendant `TableCell`s render as `<th scope="col">`.

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
    </TableRow>
  </TableHead>
</Table>
```

## Props

| Prop    | Type                        | Default   | Description                 |
| ------- | --------------------------- | --------- | --------------------------- |
| `color` | `keyof Theme['text']`       | —         | Text color.                 |
| `bg`    | `keyof Theme['background']` | —         | Background color.           |
| `as`    | `ElementType`               | `'thead'` | Overrides the root element. |

Also supports styled-system `space` and `border` props.
