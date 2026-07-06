# ToggleButton

An individual toggle button (text or icon) — usable standalone or inside a `ToggleButtonGroup`.
Built on `Button`: it pins `variant="outlined"` and layers selected/unselected color styles on
top, so everything else (`size`, `shape`, `gap`, `startIcon` / `endIcon`, `loading`, `fullWidth`,
space/layout/border/typography props) is inherited. `variant`, `href`, `target`, and `rel` are
not part of the API. Reflects its active state via `aria-pressed`; when grouped, selection comes
from `ToggleButtonGroupContext` and color / size / disabled / fullWidth from `ButtonGroupContext`
(explicit props always win).

```tsx
<ToggleButton
  value="check"
  isSelected={isSelected}
  onChange={() => setIsSelected((prev) => !prev)}
  aria-label="check"
>
  <Icon name="check" size="1em" color="inherit" />
</ToggleButton>
```

## Props

| Prop         | Type                                | Default     | Description                                                        |
| ------------ | ----------------------------------- | ----------- | ------------------------------------------------------------------ |
| `value`      | `string \| number`                  | —           | The value associated with the button inside a group. **Required.** |
| `isSelected` | `boolean`                           | _inferred_  | Active state — inferred from the group's value when omitted.       |
| `color`      | `keyof Theme['palette']`            | `'default'` | Active-state color. Inherited from the group.                      |
| `onChange`   | `(value: string \| number) => void` | —           | Fired with the button's `value` when toggled.                      |
| `loading`    | `boolean`                           | `false`     | Shows a spinner and disables the button — e.g. while saving.       |

All other `Button` props (except `variant` / `href` / `target` / `rel`) pass through. `type`
defaults to `'button'`. Icon-only buttons need an `aria-label`.
