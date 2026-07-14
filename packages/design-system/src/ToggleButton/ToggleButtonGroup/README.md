# ToggleButtonGroup

A `ButtonGroup` of `ToggleButton`s with single (exclusive) or multiple selection.
Built on `ButtonGroup`: joined corners, merged borders, orientation, `borderRadius`, and the
color / size / disabled / fullWidth broadcast are all inherited; this component adds the
selection state (via `ToggleButtonGroupContext`) and restores the active-color border edge on
selected children. Renders `role="group"` (give it an accessible label). **Controlled** — the
consumer owns `value`.

```tsx
const [platform, setPlatform] = useState('web')

<ToggleButtonGroup isExclusive value={platform} onChange={setPlatform} aria-label="Platform">
  <ToggleButton value="web">Web</ToggleButton>
  <ToggleButton value="android">Android</ToggleButton>
  <ToggleButton value="ios">iOS</ToggleButton>
</ToggleButtonGroup>
```

## Props

| Prop           | Type                                                  | Default        | Description                                                                         |
| -------------- | ----------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| `value`        | `string \| number \| Array<string \| number> \| null` | `null`         | Selected value(s) — single when `isExclusive`, array otherwise.                     |
| `onChange`     | `(value) => void`                                     | —              | Next selection: single value or `null` (exclusive), array possibly empty otherwise. |
| `isExclusive`  | `boolean`                                             | `false`        | Only one child value can be selected at a time.                                     |
| `color`        | `keyof Theme['palette']`                              | `'default'`    | Selected-state color for all children.                                              |
| `size`         | `keyof Theme['sizes']`                                | `'md'`         | Density for all children.                                                           |
| `orientation`  | `'horizontal' \| 'vertical'`                          | `'horizontal'` | Layout flow direction.                                                              |
| `borderRadius` | `keyof Theme['radii']`                                | `'md'`         | Rounds the group's outer corners only.                                              |
| `disabled`     | `boolean`                                             | `false`        | Disables all children.                                                              |
| `fullWidth`    | `boolean`                                             | `false`        | Group fills its container; children share the width.                                |

All other `ButtonGroup` props (except `variant`) pass through, including `space` props.

## Enforcing at least one active value

Deselection is allowed by default (`null` / `[]`). To require one active option, guard in your
handler instead of a prop:

```tsx
const handleChange = (next) => {
  if (next !== null && (!Array.isArray(next) || next.length > 0)) setValue(next)
}
```

## Accessibility

- The group renders `role="group"` — always provide `aria-label` or `aria-labelledby`.
- Each `ToggleButton` reflects its state via `aria-pressed` and sits in DOM/tab order.
