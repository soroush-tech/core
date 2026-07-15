# ButtonGroup

Groups related `Button` immediate children into a visually joined cluster — adjacent borders
collapse and the group's `borderRadius` rounds only its outer corners (the first/last buttons keep
their leading/trailing corners; every inner corner is squared). Broadcasts `variant` / `color` /
`size` / `disabled` / `fullWidth` to children via `ButtonGroupContext`; explicit props on a child
always win.

```tsx
<ButtonGroup variant="contained" aria-label="Basic button group">
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
```

## Props

| Prop           | Type                                  | Default        | Description                                          |
| -------------- | ------------------------------------- | -------------- | ---------------------------------------------------- |
| `variant`      | `'contained' \| 'outlined' \| 'text'` | `'outlined'`   | Visual style for all child buttons.                  |
| `color`        | `keyof Theme['palette']`              | `'primary'`    | Color palette for all child buttons.                 |
| `size`         | `keyof Theme['sizes']`                | `'md'`         | Density for all child buttons.                       |
| `orientation`  | `'horizontal' \| 'vertical'`          | `'horizontal'` | Layout flow direction.                               |
| `borderRadius` | `keyof Theme['radii']`                | `'md'`         | Group corner radius — rounds the outer corners only. |
| `disabled`     | `boolean`                             | `false`        | Disables all child buttons.                          |
| `fullWidth`    | `boolean`                             | `false`        | Group fills its container; children share the width. |
| `as`           | `ElementType`                         | `'div'`        | Overrides the root element.                          |

Also supports `space` props on the root.

## Notes

- Renders `role="group"` — always provide `aria-label` or `aria-labelledby`.
- Separation between adjacent buttons is variant-aware: `outlined` hides the trailing button's
  leading edge (keeping its width) so the `-thin` overlap shows a single, un-doubled border, while
  `contained` and `text` draw a divider there instead (the color's `dark` shade for `contained`, a
  translucent `main` for `text`).
- Children must be immediate `Button`s (or components that read `ButtonGroupContext`).
- This design system's buttons are flat (no elevation), so no `shouldDisableElevation` prop exists.
- A split button (dropdown-driven action) is a composition of `ButtonGroup` + a menu and needs a
  `Menu` component, which the design system doesn't have yet.
