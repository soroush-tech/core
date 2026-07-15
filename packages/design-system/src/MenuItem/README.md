# MenuItem

A single option row for [`Select`](../Select/README.md)'s listbox, rendered as a semantic
`<li role="option">`. On its own it renders a styled, static row; inside a `Select` the
selection, highlight, density, and accent props are injected automatically — you only supply
`value` and the label.

```tsx
import { Select } from '@soroush.tech/design-system/Select'
import { MenuItem } from '@soroush.tech/design-system/MenuItem'

;<Select placeholder="Pick a platform">
  <MenuItem value="web">Web</MenuItem>
  <MenuItem value="android">Android</MenuItem>
  <MenuItem value="ios">iOS</MenuItem>
</Select>
```

## Props

| Prop                    | Type                                | Default        | Description                                                                                          |
| ----------------------- | ----------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `value`                 | `string \| number`                  | —              | The value this option represents — reported to `Select`'s `onChange`. **Required.**                  |
| `children`              | `ReactNode`                         | —              | The option label.                                                                                    |
| `as`                    | `ElementType`                       | `'li'`         | The element used for the root node.                                                                  |
| `disabled`              | `boolean`                           | `false`        | Disables the option — it cannot be highlighted or selected.                                          |
| `selected`              | `boolean`                           | `false`        | Marks the option as the current selection. **Injected by `Select`.**                                 |
| `highlighted`           | `boolean`                           | `false`        | Marks the option as the keyboard-highlighted row. **Injected by `Select`.**                          |
| `multiple`              | `boolean`                           | `false`        | Reserves a leading checkmark slot for multi-select menus. **Injected by `Select`.**                  |
| `color`                 | `keyof Theme['palette']`            | `'primary'`    | Accent color for hover/selected shading — resolves to `theme.palette[color]`.                        |
| `textColor`             | `keyof Theme['text']`               | color's `main` | Base text color of the row — resolves against `theme.text`. Falls back to the accent color's `main`. |
| `size`                  | `keyof Theme['sizes']`              | `'md'`         | Density token — resolves against `theme.sizes`.                                                      |
| `dense`                 | `boolean`                           | `false`        | Compact vertical padding, independent of `size`.                                                     |
| `disableGutters`        | `boolean`                           | `false`        | Remove the left and right padding.                                                                   |
| `divider`               | `boolean`                           | `false`        | Add a 1px bottom border to separate the row.                                                         |
| `autoFocus`             | `boolean`                           | `false`        | Focus the row on first mount, and whenever `autoFocus` flips from `false` to `true`.                 |
| `focusVisibleClassName` | `string`                            | —              | Class applied only while the row has keyboard focus — a `:focus-visible` hook.                       |
| `onSelect`              | `(value: string \| number) => void` | —              | Fired with `value` when the option is chosen. **Injected by `Select`.**                              |
| `id`                    | `string`                            | —              | DOM id. `Select` assigns one so the trigger can reference it via `aria-activedescendant`.            |

## Notes

- `color` and `textColor` are supplied by `Select` (from its own props), but an item's own value
  **wins** — set them on a `MenuItem` to override the row's accent or text color.
- Hover and selected shading are derived from `theme.palette[color]` with hex-suffix opacity, so
  the row stays on-theme in both color schemes.
- `mousedown` is prevented so clicking an option does not blur `Select`'s trigger — the trigger
  keeps focus for its `aria-activedescendant` model.
