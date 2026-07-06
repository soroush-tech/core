# TableRow

A row in a table. Renders `<tr>` with optional hover and selected shading.

```tsx
<TableRow isHoverable isSelected={row.id === selectedId}>
  <TableCell>web</TableCell>
</TableRow>
```

## Props

| Prop          | Type                        | Default | Description                                                |
| ------------- | --------------------------- | ------- | ---------------------------------------------------------- |
| `isHoverable` | `boolean`                   | `false` | Shades the row on hover with `theme.background.secondary`. |
| `isSelected`  | `boolean`                   | `false` | Applies the selected shading (`theme.background.grid`).    |
| `color`       | `keyof Theme['text']`       | —       | Text color.                                                |
| `bg`          | `keyof Theme['background']` | —       | Background color.                                          |
| `as`          | `ElementType`               | `'tr'`  | Overrides the root element.                                |

Also supports styled-system `space` and `border` props.
