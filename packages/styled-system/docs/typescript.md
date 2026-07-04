# TypeScript

`@soroush.tech/styled-system` ships its own first-class types — it **replaces
`@types/styled-system`**, and the public type surface matches `@types/styled-system@5.1.25`
so existing typed code keeps compiling.

## Typing component props

Every style function has a matching prop interface. Compose the ones you use into your
component's props. Each interface is generic over your `Theme`, so prop values are
**scale-aware** — they resolve to keys of the relevant theme scale.

```tsx
import styled from '@emotion/styled'
import {
  space,
  color,
  typography,
  type SpaceProps,
  type ColorProps,
  type TypographyProps,
  type Theme,
} from '@soroush.tech/styled-system'

const theme = {
  space: [0, 4, 8, 16, 32, 64],
  fontSizes: [12, 14, 16, 24, 32],
  colors: { primary: '#0077cc', white: '#fff' },
} satisfies Theme

type AppTheme = typeof theme

type BoxProps = SpaceProps<AppTheme> & ColorProps<AppTheme> & TypographyProps<AppTheme>

const Box = styled('div')<BoxProps>(space, color, typography)

// `m` → space index, `bg`/`color` → colors keys, `fontSize` → fontSizes index.
// `bg="green"` would be a compile error — green isn't in the theme's colors.
;<Box m={2} bg="primary" color="white" fontSize={3} />
```

## How scale-awareness works

`SpaceProps<ThemeType, TVal = ThemeValue<'space', ThemeType>>` derives the value type
`TVal` from the theme via the `ThemeValue` helper:

- array scale (`space: [...]`) → the value type is `number` (an index)
- object scale (`colors: { primary, … }`) → the value type is the key union

The seven scale-bound groups mirror `@types/styled-system`: `space` (`SpaceProps`,
`MarginProps`, `PaddingProps`), `colors` (`ColorProps`, `BorderProps.borderColor`),
`fontSizes`/`fontWeights`/`lineHeights` (`TypographyProps`), and `radii`
(`BorderProps.borderRadius`). Everything else is typed as the corresponding CSS property.

Prop interfaces exported: `SpaceProps`, `MarginProps`, `PaddingProps`, `LayoutProps`,
`TypographyProps`, `FlexboxProps`, `PositionProps`, `ColorProps`, `BorderProps`,
`BackgroundProps`, `GridProps`, `ShadowProps`, plus the foundation types `Theme`,
`RequiredTheme`, `ResponsiveValue`, `ThemeValue`, `ObjectOrArray`, `TLengthStyledSystem`.

## Custom style functions are typed too

`system()` / `createParser()` / `compose()` return a `Parser` — a callable that drops
straight into Emotion's or styled-components' `styled()` as an interpolation. Its call
signature is currently loosened to `(...args: any[]): any` to match the original
`@styled-system` `styleFn`, so the style functions stay permissive interpolations on any
host element. A stricter `<P extends { theme?: unknown }>(props: P) => CSSObject`
signature is planned for a future major.

## Drop-in for existing `styled-system` + `@types/styled-system`

Swap via a package-manager alias — no code or type changes:

```jsonc
"dependencies": {
  "styled-system": "npm:@soroush.tech/styled-system@^5"
}
```

A runnable, `tsc`-verified example lives in
[`styled-system/typescript`](https://github.com/soroush-tech/examples/tree/main/styled-system/typescript).
