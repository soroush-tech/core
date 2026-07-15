# Quote

A `View` with a fixed 2px primary left border — used for terminal readouts and markdown
blockquotes.

## Props

Accepts all `ViewProps` — spacing (`p`, `m`, …), layout, `bg` (→ `theme.background`),
`borderRadius` (→ `theme.radii`), and so on. Only the left border is fixed by the component; every
other visual is a passthrough View prop.

```tsx
<Quote bg="terminal" p={3} borderRadius="md">
  <Typography variant="body1" color="secondary">
    Quoted content
  </Typography>
</Quote>
```
