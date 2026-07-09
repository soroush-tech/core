# TableContainer

Scroll wrapper for `Table`. Extends `View` and adds `overflow-x: auto`, so wide tables scroll
horizontally inside it instead of breaking the page layout. Give it a bounded `maxHeight` to make
`Table`'s `hasStickyHeader` stick.

```tsx
<TableContainer maxHeight="320px">
  <Table hasStickyHeader>…</Table>
</TableContainer>
```

## Props

Accepts every `View` prop — `bg`, `borderColor`, `borderWidth`, `borderRadius`, spacing, layout,
position, and `as` (default `'div'`). See `src/theme/View/README.md`.
