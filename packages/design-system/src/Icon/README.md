# Icon

Renders a themeable SVG icon from the central registry. Consumers pass a `name`; `Icon` owns every `?react` import and maps the name to its component.

```tsx
import { Icon } from '@soroush.tech/design-system/Icon'
;<Icon name="hub" color="primary" size="2rem" />
```

## How color works

The styled `svg` sets `fill: currentColor` and maps the `color` prop to `theme.text`. Because a CSS `fill` rule overrides an SVG's baked `fill="#hex"` presentation attribute, filled icons recolour through the theme **without editing the asset files**. Stroke-based icons rely on their paths keeping an explicit `fill="none"` — otherwise they'd inherit `currentColor` and render as filled blobs (see the generation contract below).

## Adding an icon

Icons live as generated TSX components in `icons/` — the package has no bundler SVG pipeline, so consumers need no svgr/loader setup.

1. Generate the component from the `.svg` — **`--no-svgo` is mandatory** so stroke icons keep their per-path `fill="none"`:

   ```sh
   npx @svgr/cli --typescript --jsx-runtime automatic --no-svgo --no-index --out-dir src/Icon/icons path/to/new_icon.svg
   ```

2. Import it in `icons.ts` (`import NewIconIcon from './icons/NewIcon'`) and add it to the `icons` map.

The `name` prop is typed from the registry keys (`IconName`), so new icons get autocomplete and type-checking automatically. `Icon.test.tsx` renders every registry entry and asserts the `fill="none"` contract, so a bad generation fails the suite instead of shipping.

## Props

| Prop    | Type                  | Default     | Description                                                           |
| ------- | --------------------- | ----------- | --------------------------------------------------------------------- |
| `name`  | `IconName`            | —           | Registry key of the icon to render (required).                        |
| `color` | `keyof Theme['text']` | `'primary'` | Icon colour — resolves from `theme.text`, applied via `currentColor`. |
| `size`  | `string \| number`    | `'1.5rem'`  | Sets both width and height (icons are square).                        |

Also accepts `LayoutProps`, `SpaceProps`, and any passthrough SVG attribute (`className`, `data-*`, `aria-*`). Renders `aria-hidden` by default — pass `aria-hidden={false}` and an `aria-label` for meaningful icons.
