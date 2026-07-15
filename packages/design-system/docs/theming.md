# Theming

The theme belongs to you — the package ships defaults, every part is replaceable, and the type system widens with your extensions. This guide covers the full ladder, from using the built-ins to owning every token.

## The ladder

1. **Use the default** — `<ThemeProvider>` with no props renders the built-in `baseTheme` (dark-schemed).
2. **Override values** — build your theme with `createTheme(base, overrides)` and pass it via `theme`.
3. **Repoint component defaults** — `theme.defaults` / the provider's `defaults` prop change what components fall back to.
4. **Extend the type system** — declaration merging adds palette colors, scale keys, and whole scales.
5. **Customize single components** — `theme.components` (see [customization.md](./customization.md)).

---

## One theme, yours

`ThemeProvider` provides exactly one theme. The package ships a single complete default — `baseTheme` — and you derive every mode from it; switching (dark/light, or ten brand modes) is your state:

```tsx
import { ThemeProvider } from '@soroush.tech/design-system/ThemeProvider'
import { baseTheme, createTheme } from '@soroush.tech/design-system/themes'

const dark = createTheme(baseTheme, { name: 'dark' /* your palettes */ })
const light = createTheme(baseTheme, { name: 'light', colorScheme: 'light' /* your palettes */ })

const [isDark, setIsDark] = useState(true)
<ThemeProvider theme={isDark ? dark : light}>{app}</ThemeProvider>
```

## Building themes with `createTheme`

`createTheme(base, overrides)` deep-merges sparse patches onto a base theme:

```ts
import { baseTheme, createTheme } from '@soroush.tech/design-system/themes'

export const brandDark = createTheme(baseTheme, {
  palette: { primary: { main: '#00ff88' } }, // sibling fields (light/dark/contrastText) survive
  radii: { md: '10px' },
  shadows: ['none'], // arrays replace wholesale, never merge
})
```

Merge rules: plain objects recurse; arrays (`shadows`, `fontSizes`) and functions replace wholesale; `undefined` values are ignored — keys are added or replaced, never removed. Neither argument is mutated.

## Component defaults (`theme.defaults`)

Components carry visible literal fallbacks (`size = 'md'`, `variant = 'outside'`, …) resolved through `themeDefault(theme, key, fallback)`. The optional `theme.defaults` map overrides any of them globally — essential when your theme uses entirely different size or palette keys:

```tsx
<ThemeProvider defaults={{ size: 'compact', color: 'brand', switchVariant: 'inside' }}>
```

The full key table lives in the [README's Theming section](../README.md#component-defaults). The built-in `baseTheme` carries no `defaults` — the literals apply until you say otherwise. For _per-component_ defaults (only Buttons compact), use `theme.components.X.defaultProps` instead ([customization.md](./customization.md)).

## Extending the type system

Every scale is an open interface declared on `@emotion/react` — the augmentation surface is Emotion's module because the published d.ts is chunk-bundled, and only an external, stable module merges reliably for every consumer:

```ts
import type { PaletteEntry, SizeEntry } from '@soroush.tech/design-system/themes'

declare module '@emotion/react' {
  interface ThemePalette {
    brand: PaletteEntry // new palette color
  }
  interface ThemeBackground {
    tertiary: string // new background token
  }
  interface ThemeSizes {
    xl: SizeEntry // new size step
  }
  interface Theme {
    elevations: Record<'low' | 'mid' | 'high', string> // whole new scale
  }
}
```

Component prop unions derive via `keyof Theme['scale']`, so `color="brand"`, `bg="tertiary"`, and `size="xl"` typecheck everywhere automatically. Then supply the values:

```ts
const brand = createTheme(baseTheme, {
  palette: { brand: { main: '#00ff88', light: '#66ffb2', dark: '#00b25f', contrastText: '#000' } },
  background: { tertiary: '#101418' },
  sizes: { xl: { paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4, fontSize: 2 } },
  elevations: { low: '0 1px 2px', mid: '0 2px 6px', high: '0 6px 18px' },
  defaults: { size: 'xl' }, // components may default to augmented keys
})
```

Two rules: new object-valued keys (like a `PaletteEntry`) must be supplied complete — components read `.main`/`.contrastText` at runtime; and TypeScript cannot verify at runtime that an augmented token was supplied — **always pair an augmentation with the matching override**.

## The scale interfaces

| Scale           | Key in Theme           | Interface                 |
| --------------- | ---------------------- | ------------------------- |
| Palette         | `theme.palette`        | `ThemePalette`            |
| Text colors     | `theme.text`           | `ThemeText`               |
| Backgrounds     | `theme.background`     | `ThemeBackground`         |
| Borders         | `theme.border`         | `ThemeBorder`             |
| Space           | `theme.space`          | `ThemeSpace`              |
| Sizes           | `theme.sizes`          | `ThemeSizes`              |
| Radii           | `theme.radii`          | `ThemeRadii`              |
| Border widths   | `theme.borderWidths`   | `ThemeBorderWidths`       |
| Fonts           | `theme.fonts`          | `ThemeFonts`              |
| Font weights    | `theme.fontWeights`    | `ThemeFontWeights`        |
| Line heights    | `theme.lineHeights`    | `ThemeLineHeights`        |
| Letter spacings | `theme.letterSpacings` | `ThemeLetterSpacings`     |
| Typography      | `theme.typography`     | `ThemeTypographyVariants` |
| Avatar sizes    | `theme.avatar`         | `ThemeAvatarSizes`        |
| Icon sizes      | `theme.icon`           | `ThemeIconSizes`          |
| Switch tokens   | `theme.switch`         | `ThemeSwitch`             |
| Shadow tokens   | `theme.shadow`         | `ThemeShadow`             |
| Syntax colors   | `theme.syntax`         | `ThemeSyntax`             |
| Defaults        | `theme.defaults`       | `ThemeDefaults`           |
| Components      | `theme.components`     | `ThemeComponents`         |

The contract is verified against the real published d.ts by `type-tests/augmentation.ts` (`pnpm test:types`), so it can't silently break in a release.
