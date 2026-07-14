# Select

A form select with a custom, themeable listbox — and a `native` escape hatch. It takes
[`MenuItem`](../MenuItem/README.md) children as its options, supports single and multiple
selection, and integrates with `Form` / `FormControl` context exactly like `NativeSelect` and
`TextInput`.

```tsx
import { Select } from '@soroush.tech/design-system/Select'
import { MenuItem } from '@soroush.tech/design-system/MenuItem'

;<Select variant="outlined" placeholder="Pick a platform" onChange={(value) => console.log(value)}>
  <MenuItem value="web">Web</MenuItem>
  <MenuItem value="android">Android</MenuItem>
  <MenuItem value="ios">iOS</MenuItem>
</Select>
```

## `native`

- **`native={false}`** (default) — renders a `role="combobox"` trigger and a portaled
  `role="listbox"` popover, positioned under the trigger. Fully themeable option rows, supports
  `multiple`.
- **`native={true}`** — delegates to [`NativeSelect`](../NativeSelect/README.md) (a real
  `<select>`), deriving its `options` from the `MenuItem` children's `value` + label. Single-select
  only; `multiple` is ignored on this path.

## Props

| Prop                                            | Type                                               | Default                       | Description                                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `children`                                      | `ReactNode`                                        | —                             | `MenuItem` children, one per option (direct descendants — not wrapped in a Fragment).                                                 |
| `native`                                        | `boolean`                                          | `false`                       | Render a native `<select>` instead of the custom listbox.                                                                             |
| `multiple`                                      | `boolean`                                          | `false`                       | Allow selecting several options — `value` becomes an array. Ignored when `native`.                                                    |
| `autoWidth`                                     | `boolean`                                          | `false`                       | Size the trigger to the current selection. When `false`, it reserves the widest option's width so selecting doesn't shift the layout. |
| `value`                                         | `string \| number \| Array<string \| number>`      | —                             | Controlled value — a single value, or an array when `multiple`.                                                                       |
| `defaultValue`                                  | `string \| number \| Array<string \| number>`      | —                             | Uncontrolled initial value.                                                                                                           |
| `onChange`                                      | `(value) => void`                                  | —                             | Fired with the next value whenever the selection changes.                                                                             |
| `open`                                          | `boolean`                                          | —                             | Controlled open state of the listbox.                                                                                                 |
| `defaultOpen`                                   | `boolean`                                          | `false`                       | Uncontrolled initial open state.                                                                                                      |
| `onOpen` / `onClose`                            | `() => void`                                       | —                             | Fired when the listbox requests to open / close.                                                                                      |
| `placeholder`                                   | `string`                                           | —                             | Empty-state label shown in the trigger while nothing is selected.                                                                     |
| `renderValue`                                   | `(value) => ReactNode`                             | —                             | Override the trigger's rendered content for the current value.                                                                        |
| `variant`                                       | `'default' \| 'outlined' \| 'text' \| 'underline'` | `'default'`                   | Visual style — mirrors `TextInput` / `NativeSelect`.                                                                                  |
| `color`                                         | `keyof Theme['palette']`                           | `'primary'`                   | Focus/active border color — resolves to `theme.palette[color].main`.                                                                  |
| `textColor`                                     | `keyof Theme['text']`                              | color's `main`                | Text color of the trigger value and rows. Defaults to `palette[color].main`; a token overrides it.                                    |
| `bg`                                            | `keyof Theme['background']`                        | `'terminal'`                  | Background color of the trigger and the popover surface (`Paper`).                                                                    |
| `size`                                          | `keyof Theme['sizes']`                             | `'md'`                        | Controls padding and font size. Inherited from `FormControl` / `Form`.                                                                |
| `borderRadius`                                  | `keyof Theme['radii']`                             | —                             | Corner radius — applies only to `default` and `outlined` variants.                                                                    |
| `disabled` / `error` / `required` / `fullWidth` | `boolean`                                          | `false`                       | Field state. Inherited from `FormControl` / `Form`.                                                                                   |
| `iconName`                                      | `IconName`                                         | `expand_more` / `expand_less` | Dropdown affordance icon. Defaults swap on open.                                                                                      |
| `iconProps`                                     | `Omit<IconProps, 'name'>`                          | —                             | Extra props for the dropdown icon.                                                                                                    |
| `id` / `name`                                   | `string`                                           | —                             | `id` is inherited from `FormControl`. `name` emits a hidden input for form submission.                                                |
| `labelId`                                       | `string`                                           | —                             | Id of a visible label element that labels the trigger.                                                                                |

Also supports all `space` props (`p`, `m`, …) plus `width` / `minWidth` / `maxWidth` on the trigger.

## Keyboard

| Key                     | Behavior                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `Space` / `Enter`       | Open when closed; select the highlighted option when open.     |
| `ArrowDown` / `ArrowUp` | Open when closed; move the highlight (skipping disabled rows). |
| `Home` / `End`          | Highlight the first / last enabled option.                     |
| `Escape`                | Close the listbox.                                             |

The trigger keeps focus while the listbox is open and points at the active row via
`aria-activedescendant`; the popover is portaled so it is never clipped by an overflow ancestor.

## Form integration

```tsx
<FormControl error fullWidth>
  <FormLabel id="platform-label">Platform</FormLabel>
  <Select labelId="platform-label" placeholder="Pick a platform">
    <MenuItem value="web">Web</MenuItem>
    <MenuItem value="android">Android</MenuItem>
  </Select>
  <FormHelperText>Pick the platform to deploy to.</FormHelperText>
</FormControl>
```

## Notes

- `bg` is applied to the popover surface (the `Paper`), so the whole dropdown shares one background.
- `color` and `textColor` cascade to every `MenuItem`, but an item's own value **wins** — set them
  on a `MenuItem` to restyle a single row.
- Options must be **direct** `MenuItem` children (or an array of them) — a `Fragment` wrapper is
  not descended into, mirroring the platform `<select>`/`<option>` relationship.
- On the `native` path, option labels are coerced to strings; rich (non-text) labels only render in
  the custom listbox.
