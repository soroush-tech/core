# NativeSelect

A styled native `<select>` form control. Renders `options` data as `<option>` elements, shows a
dropdown affordance icon, and integrates with `Form` / `FormControl` context the same way
`TextInput` does. Being native, it is keyboard-operable, screen-reader friendly, and SSR-safe by
default.

```tsx
import { NativeSelect } from 'src/theme/NativeSelect'

;<NativeSelect
  variant="outlined"
  placeholder="Pick a platform"
  options={[
    { label: 'Web', value: 'web' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' },
  ]}
  onChange={(value) => console.log(value)}
/>
```

## Props

| Prop           | Type                                                | Default         | Description                                                                                          |
| -------------- | --------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `options`      | `Array<{ label: string; value: string \| number }>` | —               | The options to populate the select with. **Required.**                                               |
| `value`        | `string \| number`                                  | —               | Controlled value — matches an option's `value`.                                                      |
| `defaultValue` | `string \| number`                                  | —               | Uncontrolled initial value.                                                                          |
| `onChange`     | `(value: string \| number) => void`                 | —               | Fired with the selected option's original `value` — numeric options round-trip as numbers.           |
| `placeholder`  | `string`                                            | —               | Empty-state label rendered as a disabled first option, shown while nothing is selected.              |
| `variant`      | `'default' \| 'outlined' \| 'text' \| 'underline'`  | `'default'`     | Visual style — mirrors `TextInput`'s variants.                                                       |
| `color`        | `keyof Theme['palette']`                            | `'primary'`     | Focus/active border color — resolves to `theme.palette[color]`. Inherited from `FormControl`/`Form`. |
| `bg`           | `keyof Theme['background']`                         | `'terminal'`    | Background color — resolves against `theme.background`.                                              |
| `textColor`    | `keyof Theme['text']`                               | `'primary'`     | Text color of the selected value. Inherited from `FormControl`/`Form`.                               |
| `size`         | `keyof Theme['sizes']`                              | `'md'`          | Controls padding and font size. Inherited from `FormControl`/`Form`.                                 |
| `disabled`     | `boolean`                                           | `false`         | Disables the select. Inherited from `FormControl`/`Form`.                                            |
| `error`        | `boolean`                                           | `false`         | Applies the error border color. Inherited from `FormControl`.                                        |
| `required`     | `boolean`                                           | `false`         | Marks the native select as required. Inherited from `FormControl`.                                   |
| `fullWidth`    | `boolean`                                           | `false`         | Stretches the root to fill its container. Inherited from `FormControl`/`Form`.                       |
| `borderRadius` | `keyof Theme['radii']`                              | —               | Corner radius — applies only to `default` and `outlined` variants.                                   |
| `iconName`     | `IconName`                                          | `'expand_more'` | Dropdown affordance icon from the Icon registry.                                                     |
| `iconProps`    | `Omit<IconProps, 'name'>`                           | —               | Extra props for the dropdown icon.                                                                   |
| `selectProps`  | `SelectHTMLAttributes<HTMLSelectElement>`           | —               | Extra attributes spread onto the native `<select>`. Explicit top-level props take priority.          |
| `id` / `name`  | `string`                                            | —               | Native passthrough. `id` is inherited from `FormControl` when omitted.                               |

Also supports all `space` props (`p`, `m`, and directional variants) plus `width` / `minWidth` /
`maxWidth` on the root.

## Form integration

Wrap in `FormControl` to wire label, helper text, and shared field state automatically —
resolution order is explicit prop → `FormControl` → `Form` → default:

```tsx
<FormControl error fullWidth>
  <FormLabel>Platform</FormLabel>
  <NativeSelect options={platformOptions} placeholder="Pick a platform" />
  <FormHelperText>Pick the platform to deploy to.</FormHelperText>
</FormControl>
```

## Notes

- Implemented as a **native** `<select>` — there is no custom popover/listbox layer, so option
  rendering is limited to plain text labels.
- The DOM casts option values to strings; `onChange` maps back to the original option value so
  `value: 10` comes back as the number `10`.
- Multiple selection is intentionally not supported.
