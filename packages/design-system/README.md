# @soroush.tech/design-system

[![npm version](https://img.shields.io/npm/v/@soroush.tech/design-system.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/design-system.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)
[![coverage](https://codecov.io/gh/soroush-tech/core/branch/main/graph/badge.svg?flag=design-system)](https://app.codecov.io/gh/soroush-tech/core?flags%5B0%5D=design-system)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/design-system.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)
[![types included](https://img.shields.io/npm/types/@soroush.tech/design-system.svg?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)
[![license](https://img.shields.io/npm/l/@soroush.tech/design-system.svg?cacheSeconds=86400)](./LICENSE)

**Your design system. Your tokens. Your rules.**
A fully typed React component library where nothing is hardcoded — every color, scale, and default belongs to you, not the package.

Tired of forking a component library just to change a color? Every token here is designed to be overridden — theming isn't an afterthought, it's the whole point.

## Install

```sh
npm i @soroush.tech/design-system
```

`react` and `react-dom` are peer dependencies. Emotion is an internal implementation detail — it ships as a regular dependency, not a peer, so you never install it yourself.

---

## Importing

Import components by subpath, styling primitives from the barrel:

```ts
import { Typography } from '@soroush.tech/design-system/Typography'
import { Flex } from '@soroush.tech/design-system/Flex'
```

Styling primitives (the engine) come from the barrel `@soroush.tech/design-system` — `styled`, `css`, `keyframes`, the `Theme` type, styled-system functions, and `createShouldForwardProp`. The barrel (`src/index.ts`) is the engine abstraction layer: to swap the CSS-in-JS engine, only that file changes.

```ts
import { styled, css, type Theme } from '@soroush.tech/design-system'
```

`ThemeProvider` and the theme-value hooks (`useTheme`, `useDefaultProps`, `withTheme`) live at their own subpath:

```ts
import { ThemeProvider, useTheme } from '@soroush.tech/design-system/theme'
```

Style-computation helpers (`useStyle`, `withStyles`, `StylesConsumer`) — resolving a `StyleInput`/`StyleFactory` into a `CSSObject` — live at their own subpath:

```ts
import { useStyle } from '@soroush.tech/design-system/style'
```

Raw engine primitives for building your own global styles — `Global`, `globalStyles`, and the SSR-only `CacheProvider`/`styleCache` pairing — live at their own subpath, not the barrel:

```ts
import { Global, globalStyles, CacheProvider, styleCache } from '@soroush.tech/design-system/engine'
```

`Global` (retyped against this package's `Theme`) applies app-wide CSS and should render inside `ThemeProvider` so it resolves against the active theme. `globalStyles(theme)` is the base reset this package owns — box-sizing, margin/table resets, and theme-driven body colors — compose it into your own `Global` styles array alongside your app's own concerns (font-family, webfont loading, and anything else app-specific stay entirely app policy).

SSR critical-CSS extraction (e.g. with `@emotion/server`) is a separate, opt-in concern most apps never need — that's what `CacheProvider` and its paired `styleCache` instance are for.

---

## Component inventory

### Layout & surfaces

| Component | Purpose                                           |
| --------- | ------------------------------------------------- |
| `View`    | Styled `div` primitive — the base building block  |
| `Flex`    | `View` with flexbox defaults                      |
| `Grid`    | CSS grid container                                |
| `Paper`   | Elevated surface with background and shadow       |
| `Card`    | Content container built on `Paper`                |
| `Quote`   | Bordered quote / terminal-panel surface on `View` |
| `AppBar`  | Top application bar                               |
| `Drawer`  | Slide-in side panel                               |

### Content & data display

| Component    | Purpose                                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Typography` | Text with variant → element mapping — the reference implementation for all components                                                                                                                                                        |
| `Link`       | Anchor with theme-aware styling                                                                                                                                                                                                              |
| `Icon`       | Icon renderer                                                                                                                                                                                                                                |
| `Image`      | Image with styled-system props                                                                                                                                                                                                               |
| `Avatar`     | User/entity avatar                                                                                                                                                                                                                           |
| `Table`      | Compound data table — exports `TableContainer`, `TableHead`, `TableBody`, `TableFooter`, `TableRow`, `TableCell`, `TablePagination`, `TablePaginationActions`, `TableSortLabel`, and `TableControl` from `@soroush.tech/design-system/Table` |

### Inputs & forms

| Component                                            | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `Button`, `ButtonGroup`, `ToggleButton`              | Actions and toggles                           |
| `TextInput`                                          | Text field                                    |
| `Checkbox`, `Radio`, `Switch`                        | Selection controls                            |
| `NativeSelect`                                       | Platform `<select>`                           |
| `Select`                                             | Custom select built on `Popover` + `MenuItem` |
| `MenuItem`                                           | Option row for `Select`'s listbox             |
| `Form`, `FormControl`, `FormLabel`, `FormHelperText` | Form composition and labeling                 |
| `Pagination`                                         | Page navigation control                       |

### Feedback

| Component                            | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `CircularProgress`, `LinearProgress` | Determinate/indeterminate progress indicators  |
| `Skeleton`                           | Loading placeholder with pulse/wave animations |
| `Backdrop`                           | Dimmed overlay behind modal surfaces           |

### Overlay & behavior primitives

| Component       | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `Portal`        | Renders children into a DOM node outside the parent hierarchy    |
| `FocusTrap`     | Keeps focus inside a subtree                                     |
| `Modal`         | Dialog primitive composing `Portal`, `Backdrop`, and `FocusTrap` |
| `Popover`       | Anchored floating surface built on `Modal`                       |
| `ThemeProvider` | Supplies the theme and global styles to the app                  |

---

## Theme tokens

Components never hardcode colors or sizes — props resolve against scales on the `Theme` object:

| Group              | Scales                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Color              | `palette` (main/light/dark/contrastText per color) · `text` · `background` · `border` · `colorScheme` |
| Typography         | `typography` (variant map) · `fonts` · `fontSizes` · `fontWeights` · `lineHeights` · `letterSpacings` |
| Space & shape      | `space` · `sizes` · `radii` · `borderWidths` · `shadows`                                              |
| Component scales   | `avatar` (size steps) · `skeleton` (wave highlight)                                                   |
| Layering & effects | `zOrder` (appBar/drawer/modal) · `blur` · `logoFilter` · `portraitBlend` · `portraitOpacity`          |

Prop types are derived from the interface (`keyof Theme['text']`), so adding a token to `themes.ts` propagates everywhere automatically. See [`design-system.md`](./design-system.md) for the full scale table and the palette rules.

---

## Theming

The theme belongs to you — the package only ships defaults. This section is the overview; the full guides are [`docs/theming.md`](./docs/theming.md) and [`docs/customization.md`](./docs/customization.md).

### One theme, yours

`ThemeProvider` provides exactly one theme — the built-in dark theme when you pass nothing. Bring one theme, or as many as you like: switching between them is your state, not the provider's.

```tsx
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { baseTheme, createTheme } from '@soroush.tech/design-system/theme'

// Zero-config: the built-in `baseTheme`.
<ThemeProvider>{app}</ThemeProvider>

// Your theme — written from scratch or extended from the base.
const brand = createTheme(baseTheme, { palette: { primary: { main: '#00ff88' } } })
<ThemeProvider theme={brand}>{app}</ThemeProvider>

// Mode switching is app policy — own the state and pass the active theme:
const [isDark, setIsDark] = useState(true)
<ThemeProvider theme={isDark ? brandDark : brandLight}>{app}</ThemeProvider>
```

`createTheme(base, overrides)` (exported from `@soroush.tech/design-system/theme`) is the merge primitive: plain objects recurse, arrays (`shadows`, `fontSizes`) and functions replace wholesale, `undefined` values are ignored — keys are added or replaced, never removed.

### Component defaults

Components carry visible literal fallbacks (`size = 'md'`, `variant = 'outside'`, …) resolved through `themeDefault(theme, key, fallback)` — so every default, including behavioral variants, is overridable via the optional `theme.defaults` map or the provider's `defaults` prop:

| Key                                          | Fallback                           | Drives                                 |
| -------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `size` / `compactSize`                       | `'md'` / `'sm'`                    | sized components / dense table actions |
| `color` / `neutralColor`                     | `'primary'` / `'default'`          | accent controls / toggle controls      |
| `textColor` / `accentTextColor`              | `'initial'` / `'primary'`          | body text / icons + input labels       |
| `bg` / `surfaceBg` / `inputBg`               | `'default'`/`'paper'`/`'terminal'` | switch track / paper surfaces / inputs |
| `borderRadius` / `surfaceRadius`             | `'md'` / `'sq'`                    | grouped controls / surfaces            |
| `avatarSize` / `borderColor` / `borderWidth` | `'md'` / `'primary'` / `'thin'`    | avatars and rings                      |
| `iconSize`                                   | `'lg'`                             | Icon default glyph size (`theme.icon`) |
| `buttonVariant` / `switchVariant`            | `'contained'` / `'outside'`        | Button / Switch visual variants        |
| `inputVariant`                               | `'default'`                        | TextInput, Select, NativeSelect frames |
| `avatarVariant` / `cardVariant`              | `'circular'` / `'paper'`           | Avatar shape / Card treatment          |
| `linkUnderline`                              | `'always'`                         | Link underline behavior                |
| `paginationVariant` / `paginationShape`      | `'text'` / `'circular'`            | Pagination items                       |

The built-in themes carry no `defaults` — the literals apply. A theme with entirely different size or palette keys stays valid by pointing the keys at its own tokens:

```tsx
<ThemeProvider defaults={{ size: 'compact', color: 'brand', switchVariant: 'inside' }}>
```

### Per-component customization (`theme.components`)

Customize one component for the whole app — default prop values, per-slot CSS, and new variant values — without wrapping or forking:

```tsx
const brand = createTheme(baseTheme, {
  components: {
    Button: {
      // Buttons default to sm + rounded; explicit props and ButtonGroup still win.
      defaultProps: { size: 'sm', shape: 'rounded' },

      // Per-slot CSS merged after Button's own styles — the theme wins the cascade,
      // but per-instance props (m, p, width, …) still beat the theme.
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          letterSpacing: theme.letterSpacings.wide,
          ...(ownerState.variant === 'contained' && { textTransform: 'none' }),
        }),
        label: { fontStyle: 'italic' },
      },

      // A new variant value — register it first so it typechecks:
      // declare module '@soroush.tech/design-system/theme' { interface ButtonVariants { dashed: true } }
      variants: [
        {
          props: { variant: 'dashed' },
          style: ({ theme }) => ({
            backgroundColor: 'transparent',
            border: `${theme.borderWidths.thin} dashed ${theme.border.primary}`,
          }),
        },
      ],
    },
  },
})
```

Style callbacks receive `{ theme, ownerState }`, where `ownerState` is the styled root's **resolved** props (after group context, `defaultProps`, and `theme.defaults`). `defaultProps` sits in the standard precedence chain: explicit prop → group context → `defaultProps` → `theme.defaults.*` → the component's literal fallback. `variants` arrays are replaced wholesale by `createTheme`, never merged.

Your own components can join the same mechanism: create their roots with this package's `styled(tag, { name: 'MyWidget', slot: 'root' })` and register the name by augmenting `ThemeComponents`. Zero-config themes pay nothing — the resolver bails out on the first check when `theme.components` is absent.

### Extending tokens (declaration merging)

Every scale is an open interface declared on `@soroush.tech/design-system/theme`, so you can add palette colors, tokens, or whole scales — and every component prop union (`color`, `bg`, `size`, …) widens automatically:

```ts
import type { PaletteEntry } from '@soroush.tech/design-system/theme'

declare module '@soroush.tech/design-system/theme' {
  interface ThemePalette {
    brand: PaletteEntry // new palette color
  }
  interface ThemeBackground {
    tertiary: string // new background token
  }
  interface Theme {
    elevations: Record<'low' | 'mid' | 'high', string> // whole new scale
  }
}
```

Then supply the values with `createTheme` and use the new keys:

```tsx
const brandDark = createTheme(baseTheme, {
  palette: { brand: { main: '#00ff88', light: '#66ffb2', dark: '#00b25f', contrastText: '#000' } },
  background: { tertiary: '#101418' },
  elevations: { low: '0 1px 2px', mid: '0 2px 6px', high: '0 6px 18px' },
})

<ThemeProvider theme={brandDark}>
  <Button color="brand" />
  <View bg="tertiary" />
</ThemeProvider>
```

Notes: new object-valued keys (like a `PaletteEntry`) must be supplied complete — components read `.main`/`.contrastText` at runtime; and TypeScript cannot verify at runtime that an augmented token was actually supplied, so always pair an augmentation with the matching override.

---

## Adding a component

Scaffold with the skill — it reads the live `Typography` files and `design-system.md` so output matches the codebase:

```
/new_theme_component ComponentName
```

Then work through the checklist at the bottom of [`design-system.md`](./design-system.md).

---

The library takes inspiration from [Material UI](https://mui.com/) — its component vocabulary and prop conventions will feel familiar — but it is written entirely in house. It is not a clone or a fork: every component is built from scratch on our own engine and token system, and the API is free to diverge wherever it serves its consumers better.

---

## Release notes

Per-version notes for every published release live in
[`release-notes/`](https://github.com/soroush-tech/core/tree/main/packages/design-system/release-notes).
