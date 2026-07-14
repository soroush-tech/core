# Icon

Renders a themeable SVG icon from the central registry. Consumers pass a `name`; `Icon` owns every `?react` import and maps the name to its component.

```tsx
import { Icon } from '@soroush.tech/design-system/Icon'
;<Icon name="hub" color="primary" size="2rem" />
```

## How color works

The styled `svg` sets `fill: currentColor` and maps the `color` prop to `theme.text`. Because a CSS `fill` rule overrides an SVG's baked `fill="#hex"` presentation attribute, icons recolour through the theme **without editing the asset files**.

## Adding an icon

1. Drop the `.svg` into `src/assets/icons/`.
2. Import it `?react` in `icons.ts` and add it to the `icons` map.

The `name` prop is typed from the registry keys (`IconName`), so new icons get autocomplete and type-checking automatically.

## Props

| Prop    | Type                  | Default     | Description                                                           |
| ------- | --------------------- | ----------- | --------------------------------------------------------------------- |
| `name`  | `IconName`            | —           | Registry key of the icon to render (required).                        |
| `color` | `keyof Theme['text']` | `'primary'` | Icon colour — resolves from `theme.text`, applied via `currentColor`. |
| `size`  | `string \| number`    | `'1.5rem'`  | Sets both width and height (icons are square).                        |

Also accepts `LayoutProps`, `SpaceProps`, and any passthrough SVG attribute (`className`, `data-*`, `aria-*`). Renders `aria-hidden` by default — pass `aria-hidden={false}` and an `aria-label` for meaningful icons.
