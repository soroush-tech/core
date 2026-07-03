# Blueprint

A full-screen background canvas with CSS grid-line decoration rendered via two `linear-gradient` layers — one horizontal, one vertical — producing an evenly spaced line-grid pattern. Also supports a radial dot variant. Used as the outermost wrapper in content`.

```tsx
<Blueprint>{/* absolutely positioned children */}</Blueprint>
```

---

## Visual behaviour

| Property           | Value                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `position`         | `relative` (contains absolutely positioned children)                                                              |
| `width`            | `100%`                                                                                                            |
| `height`           | `100vh`                                                                                                           |
| `overflow`         | `hidden`                                                                                                          |
| `background-color` | `theme.background.primary`                                                                                        |
| `color`            | `theme.text.initial`                                                                                              |
| `font-family`      | `theme.fonts.body`                                                                                                |
| Grid lines         | Two `linear-gradient` overlays using `theme.border.primary` at 5% opacity (`0D` hex suffix), 40 × 40 px cell size |

---

## Props

| Prop        | Type                    | Default    | Description                                            |
| ----------- | ----------------------- | ---------- | ------------------------------------------------------ |
| `scanline`  | `boolean`               | `false`    | Renders a fixed scanline sweep animation over the grid |
| `spotlight` | `boolean`               | `true`     | Cursor-following radial highlight over the viewport    |
| `variant`   | `'line' \| 'dot'`       | `'line'`   | Background pattern — intersecting lines or radial dots |
| `height`    | `ViewProps['height']`   | `'100vh'`  | Override the default full-viewport height              |
| `overflow`  | `ViewProps['overflow']` | `'hidden'` | Override the default overflow clipping                 |

All other `ViewProps` are inherited from `View` (space, layout, color, border, position).

---

## Notes

- Children should be `position="absolute"` (or use CSS `position: absolute`) to layer over the background.
- The `spotlight` overlay is `position: fixed` and viewport-wide, driven by the `useSpotlight` hook (pointer coordinates are written to CSS custom properties, so mouse movement never re-renders React). Pass `spotlight={false}` on decorative/nested Blueprints to avoid a duplicate overlay and listener.
- The grid-line gradient uses the hex-suffix opacity pattern: `${theme.border.primary}0D` = 5% opacity.
- Custom CSS (`styled` template) is intentional here: `background-image` and `background-size` cannot be expressed as styled-system props.
