---
description: JavaScript and TypeScript coding conventions for this project. Use when writing or reviewing any .ts/.tsx file, or when the user asks about code style or conventions.
argument-hint: [filename]
---

## Rules

### Extract the varying part - never repeat surrounding structure

When a conditional changes only one part of a value, extract that part. Never repeat the template.

```ts
// ✗
border: variant === 'outlined'
  ? `${theme.borderWidths.thin} solid ${main}`
  : `${theme.borderWidths.thin} solid transparent`

// ✓
const borderColor = variant === 'outlined' ? main : 'transparent'
border: `${theme.borderWidths.thin} solid ${borderColor}`
```

Applies everywhere: template literals, object spreads, JSX props - anywhere the surrounding structure is identical across branches.

---

### Destructure instead of repeated property access

When a variable's properties are used more than once, destructure at the top instead of accessing them repeatedly.

```ts
// ✗
const theme = _props.theme
if (_props.error) {
  return { borderColor: get(_props.theme, 'palette.error.main') }
}

// ✓
const { theme, error } = props
if (error) {
  return { borderColor: get(theme, 'palette.error.main') }
}
```

---

### Use `system()` to map a prop to a single CSS property on a theme scale

When a prop maps one-to-one to a CSS property + theme scale, always use `system()`. Never use a raw theme function or `variant()` for this.

`variant()` is for one prop → **multiple** CSS properties across **multiple** theme scales. However, `variant()` calls `css(styles)(props)` internally, which only resolves theme scale indices correctly when a ThemeProvider is present - it silently falls back to raw pixel values without one.

For one prop → multiple CSS properties → multiple theme scales, use a **raw theme function** instead. It receives `props.theme` directly from Emotion and always resolves correctly:

```ts
// ✗ - variant(): theme scale resolution breaks without ThemeProvider
const sizeVariant = variant({
  prop: 'size',
  variants: {
    sm: { paddingLeft: 1.5, paddingTop: 0.5, fontSize: 0 },
    md: { paddingLeft: 2, paddingTop: 1, fontSize: 1 },
  },
})

// ✓ - raw theme function: reads active theme directly, always works
const sizeVariant = ({ theme, size = 'md' }: { theme?: Theme; size?: AppBarSize }) => {
  const { paddingTop, paddingBottom, paddingLeft, paddingRight, fontSize } = sizes[size]
  return {
    paddingTop: theme?.space?.[paddingTop],
    paddingBottom: theme?.space?.[paddingBottom],
    paddingLeft: theme?.space?.[paddingLeft],
    paddingRight: theme?.space?.[paddingRight],
    fontSize: theme?.fontSizes[fontSize],
  }
}
```

Destructure the size config at the top so each return line only references a simple variable. Use `theme?.space?.[key]` - optional chaining handles undefined theme without an intermediate variable or type cast.

Never hardcode a theme scale value in a raw theme function. Use `system()` instead:

```ts
// ✗
const headerStyle = ({ theme }: { theme?: Theme }) => ({
  boxShadow: theme?.shadows[4],
})

// ✓
const elevationVariant = system({
  elevation: { property: 'boxShadow', scale: 'shadows' },
})
```

```ts
// ✗ - raw theme function: hardcoded, not prop-driven
const elevationStyle = ({ theme }: { theme?: Theme }) => ({
  boxShadow: theme?.shadows[4] ?? 'none',
})

// ✗ - variant(): hardcoded index list, can't read string[] scale directly
const elevationVariant = variant({
  prop: 'elevation',
  variants: {
    0: { boxShadow: 'none' },
    4: { boxShadow: 4 },
    8: { boxShadow: 8 },
  },
})

// ✓ - system(): prop-driven, reads theme.shadows[elevation] directly
const elevationVariant = system({
  elevation: { property: 'boxShadow', scale: 'shadows' },
})
```

The same pattern applies to any single prop → CSS property → theme scale mapping:

```ts
// ✓
const colorSystem = system({
  color: { property: 'backgroundColor', scale: 'background' },
})
```

---

### Barrel `index.ts` files use `export *`, never named re-exports

Every `index.ts` that exists solely to re-export a module must use `export *`. Named re-exports in barrels require manual upkeep and silently omit new exports until someone notices.

```ts
// ✗ - named re-export: new exports must be added by hand
export { StylesConsumer, withStyles, withTheme } from './withTheme'

// ✓ - wildcard: all exports picked up automatically
export * from './withTheme'
```

This applies to every barrel in the project (`src/<module>/<Name>/index.ts`, `src/<module>/hooks/index.ts`, etc.).

---

### `react-refresh/only-export-components` - extract, never disable

When a file mixes React components with non-component exports (HOFs, factories, plain functions) and triggers `react-refresh/only-export-components`, extract each non-component export into its own colocated file. Never suppress with `eslint-disable`.

```ts
// ✗ - withTheme.tsx: mixes component + HOFs, requires eslint-disable
// eslint-disable-next-line react-refresh/only-export-components
export function withStyles(...) { ... }
// eslint-disable-next-line react-refresh/only-export-components
export function withTheme(...) { ... }
export function StylesConsumer(...) { ... }  // component

// ✓ - three colocated files, no suppression needed
// StylesConsumer.tsx  → exports only the component
// withStyles.ts       → exports only withStyles
// withTheme.ts        → exports only withTheme
```

Name each file after what it exports. Keep all files in the same directory.

---

### A render closure that captures a hook instance and grows past trivial becomes a colocated component

An inline `renderX` function inside a component is fine while it stays a few lines. Once it closes over a hook/instance value (so it can't move to `utils.ts`) **and** its return is a self-contained, nameable unit of UI, extract it into a sibling component instead. The inline closure is re-created every render, can't be unit-tested in isolation, and inflates the parent until it reads as internals rather than layout + composition.

```tsx
// ✗ - inline render closure: captures `form`, grown to a cohesive UI block, only testable through the parent
function Parent() {
  const form = useParentForm()
  const renderItem = (item: ItemDef) => (
    <form.Field name={item.name}>{(api) => /* label + control + error */}</form.Field>
  )
  return <>{items.map(renderItem)}</>
}

// ✓ - colocated component: the captured instance + item passed as props, unit-testable, parent stays compositional
// Item.tsx
export function Item({ form, item }: { form: ReturnType<typeof useParentForm>; item: ItemDef }) {
  return <form.Field name={item.name}>{(api) => /* label + control + error */}</form.Field>
}
// Parent.tsx
{items.map((item) => <Item key={item.name} form={form} item={item} />)}
```

Trigger: it captures something component-local (so `utils.ts` is out) **and** the render body is a cohesive UI unit. A short formatter or a one-line wrapper stays inline. Watch for the gradual case - each addition is individually reasonable, the sum crosses the line. This is a threshold, not a hard rule.

---

### Section data lives in `SectionName.data.ts`, shared by component and test

A section's content data (arrays of cards, steps, tags, stats) goes in a sibling `SectionName.data.ts` file - never inline in the `.tsx`, and never `export`ed from it (that trips `react-refresh/only-export-components`). The component **and** its `*.test.tsx` both import from the data file, so the test iterates over the real data instead of a hardcoded copy that silently drifts when the data changes.

```ts
// SectionName.data.ts - single source of truth
export const steps = [
  { number: '01', title: 'AGILE INFRASTRUCTURE', body: '...' },
  // ...
]

// SectionName.tsx
import { steps } from './SectionName.data'

// SectionName.test.tsx - iterate, don't hardcode
import { steps } from './SectionName.data'
it.each(steps)('renders step $number ($title)', ({ number, title }) => {
  /* ... */
})
```

Assert flat string lists with `getAllByText(x).length > 0` (safe against repeats); use `getByText` for unique structured fields.

---

### Images and SVGs belong in `src/assets/` - never inline, never from `public/`

All static images (PNG, JPG, WebP) and SVG files live in `src/assets/`. Import as Vite module URLs and render with `<img>` or the theme `<Image>` component. `public/` is reserved for browser-served files that need a fixed URL (favicon, service workers, MSW worker) and must never be imported in source code.

```ts
// ✗ - importing from public/
import logo from '/soroush.svg'

// ✗ - inline SVG JSX in a component file
const SunIcon = () => <svg viewBox="0 0 24 24" stroke="currentColor">...</svg>

// ✓ - SVG file in src/assets/, imported as URL
import sunSvg from 'src/assets/sun.svg'
<Image src={sunSvg} aria-hidden="true" width={14} height={14} />
```

Note: `stroke="currentColor"` / `fill="currentColor"` in an SVG file does not inherit CSS `color` when rendered as `<img>`. Apply `theme.logoFilter` or a CSS filter when theme-aware coloring is needed.

---

### Responsive images with `vite-imagetools`

Raster images that the browser scales (any photo/mascot rendered smaller than its file, or served to varying viewports) must be imported through `vite-imagetools` query params - never as a bare URL that ships one oversized file.

**Multi-format `<picture>` - the default for any meaningful image.** Import with `?w=...&format=avif;webp;png&as=picture`, listing modern formats first and the fallback format last. The import resolves to `{ sources, img }`: `sources` is keyed by the non-fallback formats, `img` is the last format's fallback descriptor. Render a `<source>` per format with the **fallback as the `<img>`** - the `<img>` _is_ the png; old browsers that ignore `<source>` fall through to it. Never give the fallback format its own `<source>`.

```tsx
// ✗ - bare import ships one fixed-size file, one format
import portrait from 'src/assets/portrait.png'
<Image src={portrait} />

// ✓ - multi-format, multi-width
import portrait from 'src/assets/portrait.png?w=320;480;640;960&format=avif;webp;png&as=picture'

const SIZES = '(min-width: 832px) min(40vw, 520px), 100vw'

<picture>
  {Object.entries(portrait.sources).map(([format, srcSet]) => (
    <source key={format} srcSet={srcSet} type={`image/${format}`} sizes={SIZES} />
  ))}
  <Image src={portrait.img.src} sizes={SIZES} alt="..." objectFit="cover" />
</picture>
```

Single-format responsive (no `<picture>`) uses `?w=...&as=srcset&format=avif`, which resolves to a `srcSet` string. Each query shape needs a `declare module` in `src/vite-env.d.ts` - `*as=picture` returns `{ sources: Record<string, string>; img: { src: string; w: number; h: number } }`, `*format=avif` returns a `string`.

**`sizes` must match the real rendered width**, computed from the layout - not guessed. Work out the slot width at each styled-system breakpoint (defaults: **40em / 52em / 64em**; a responsive prop array `['a','b','c']` maps to base / 40em / 52em). For an `objectFit: cover` box with a square source, the **taller** side binds, so size for that.

```tsx
// grid switches to two columns at 52em (832px); portrait is the ~520px 5fr column above it
const SIZES = '(min-width: 832px) min(40vw, 520px), 100vw'
```

**Never request widths above the source's intrinsic size** - imagetools does not upscale, so larger entries just clamp to the source and waste descriptors. Check the source dimensions first; a 512px source can't serve a 2× retina slot - that's an asset problem, flag it rather than padding the width list.

**LCP images get `fetchPriority="high"`.** But `theme/Image` filters props through `@styled-system/should-forward-prop`, which pins an old `@emotion/is-prop-valid` that strips `fetchPriority`. It is already allow-listed in `Image.tsx`'s `shouldForwardProp` - keep it there; if a similar valid attribute is dropped, extend that allow-list rather than working around it.

**A `<picture>` is `display: inline` and static**, so an absolutely-positioned `<img>` inside it still resolves against the nearest positioned ancestor (the layout box), not the `<picture>`. Put `position`/`top`/`left` on the `<Image>` as before - the `<picture>` wrapper changes nothing about positioning.

---

If `$ARGUMENTS` names a file, read it and report violations with corrected code. Otherwise apply to the code being discussed.
