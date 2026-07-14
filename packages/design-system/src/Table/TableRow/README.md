# TableRow

A row in a table. Renders `<tr>` with optional hover and selected shading.

```tsx
<TableRow isHoverable isSelected={row.id === selectedId}>
  <TableCell>web</TableCell>
</TableRow>
```

## Props

| Prop          | Type                        | Default     | Description                                                                                                                |
| ------------- | --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `isHoverable` | `boolean`                   | `false`     | Shades the row on hover with `theme.palette[color].light`.                                                                 |
| `isSelected`  | `boolean`                   | `false`     | Fills the row with `theme.palette[color].dark` + contrast text.                                                            |
| `color`       | `PaletteColor`              | `'primary'` | Palette color driving the hover/selected shading (`theme.palette[color]`) — falls back to the enclosing `Table`'s `color`. |
| `bg`          | `keyof Theme['background']` | —           | Background color.                                                                                                          |
| `as`          | `ElementType`               | `'tr'`      | Overrides the root element.                                                                                                |

Also supports styled-system `space` and `border` props.
