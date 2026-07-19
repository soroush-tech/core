# Per-component customization (`theme.components`)

Customize one component for the whole app — default prop values, per-slot CSS, and new variant values — without wrapping or forking. Zero-config themes pay nothing: the resolver bails out on its first check when `theme.components` is absent.

```ts
const brand = createTheme(baseTheme, {
  components: {
    Button: {
      defaultProps: { size: 'sm', shape: 'rounded' },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          letterSpacing: theme.letterSpacings.wide,
          ...(ownerState.variant === 'contained' && { textTransform: 'none' }),
        }),
        label: { fontStyle: 'italic' },
      },
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

The `Theme/Customization` Storybook story renders all three mechanisms under a customized theme and is locked by Chromatic — it is the living contract.

Every styled element is registered — the `ThemeComponents` interface in `src/theme/themes.ts` is the authoritative key/slot list, so `styleOverrides` reaches every root and every sub-element slot (Switch's `track`/`thumb`/`input`, Select's `listbox`, LinearProgress's bars, …), including the layout primitives `View`/`Flex`/`Grid`. Two cautions: an override on `View`/`Flex`/`Grid` cascades into the internals of every composed component (use those keys for app-wide policy only), and hidden/structural slots (`input`, `valueGhost`, `positioner`) carry accessibility or layout behavior — restyle their looks, not their geometry/visibility. Note that `defaultProps` is honored only by components that resolve props through `useDefaultProps` (currently `Button` and `Card`); everywhere else, use `styleOverrides`/`variants`.

---

## `defaultProps`

Per-component default prop values. They sit in the standard resolution chain — later steps only apply when earlier ones are unset:

```
explicit prop → group context (e.g. ButtonGroup) → theme.components.X.defaultProps → theme.defaults.* → literal fallback
```

Use `theme.defaults` for global policy ("everything compact") and `defaultProps` for component policy ("only Buttons compact"). Components read them via the `useDefaultProps(name)` hook.

## `styleOverrides`

Per-slot CSS merged **after** the component's own styles — the theme wins the cascade — but **before** the styled-system prop parsers, so per-instance props (`m`, `p`, `width`, …) always beat the theme.

Values are plain CSS objects or callbacks receiving `{ theme, ownerState }`. `ownerState` is the styled root's **resolved** props — after group context, `defaultProps`, and `theme.defaults` have been applied — so a conditional like `ownerState.variant === 'contained'` sees the same value the component's own styles used. Prop-keyed conditionals belong in the callback; there are no magic override keys to memorize.

Slot names (`root`, `label`, `icon`, …) are typed per component in `ThemeComponents` and are **public API** — renaming one is a breaking change.

## `variants`

Extra variant entries matched by props: an entry applies when every key in its `props` equals the render prop. Matching runs on the component's root slot only. Note that `createTheme` replaces `variants` arrays wholesale — composing two override sets does not concatenate them.

**New variant values** need two things — the type registration and the styles:

```ts
declare module '@soroush.tech/design-system/theme' {
  interface ButtonVariants {
    dashed: true // widens ButtonVariant so variant="dashed" typechecks
  }
}
```

Registering the value without a matching `variants` entry renders an unstyled button — always pair them.

## Slot props — customizing composed sub-elements

Some slots aren't raw CSS surfaces but composed components with their own token props — Card's title is a `Typography` with `variant`/`color`/`fontFamily`. CSS overrides are the wrong tool for "make every card title a subtitle instead of an overline"; that's a **prop** change. Such components accept slot prop objects in `defaultProps`, merged under any per-instance props:

```ts
components: {
  Card: {
    defaultProps: {
      titleProps: { variant: 'subtitle1', color: 'secondary', fontFamily: 'body' },
      captionProps: { mb: 2 },
    },
    // …and the same slots are still CSS-addressable:
    styleOverrides: {
      title: { letterSpacing: '0.1em' },
    },
  },
}
```

Resolution per slot prop: component literal → theme `defaultProps.titleProps` → per-instance `titleProps` (instance wins). The slot-prop shapes are token-typed (`CardSlotTypographyProps`), so `variant`/`color`/`mb` autocomplete against your theme scales — including augmented keys.

So a composed slot is customizable at three levels: **props** (`defaultProps.titleProps`), **CSS** (`styleOverrides.title`), and **structure** (Card's `title` prop accepts a ReactNode for full replacement).

## Registering your own components

The mechanism is infrastructure, not just configuration. Create your roots with this package's `styled` and register the name:

```ts
import { styled } from '@soroush.tech/design-system'
import type { ComponentConfig } from '@soroush.tech/design-system/theme'

declare module '@soroush.tech/design-system/theme' {
  interface ThemeComponents {
    MyWidget?: ComponentConfig<{ tone?: 'calm' | 'loud' }, 'root' | 'handle'>
  }
}

const WidgetRoot = styled('div', { name: 'MyWidget' })({ padding: 8 })
const WidgetHandle = styled('span', { name: 'MyWidget', slot: 'handle' })({ cursor: 'grab' })
```

Your widget now honors `theme.components.MyWidget.styleOverrides` / `.variants` exactly like the built-ins.

## Converting a design-system component (maintainers)

`Button` is the reference implementation. The rules:

1. Pass `name` on the root and `slot` on named sub-elements. Slot names become public API.
2. Move styled-system parsers (`space`, `layout`, …) from the style arguments into the `systemProps` option — this is what keeps instance props beating theme overrides.
3. Resolve `defaultProps` via `useDefaultProps(name)` in the wrapper, in the chain above.
4. Type the component's `ThemeComponents` entry (`ComponentConfig<OwnerState, Slots>`); if it has variants, expose them via an augmentable interface (see `ButtonVariants`).
5. Cover all three mechanisms plus the precedence pairs in the component's tests.

## Runtime cost

- **Unused** (`theme.components` absent): one no-op function call and a property lookup per named root per render; anonymous roots are raw Emotion. Bundle cost of the wrapper: well under a kilobyte.
- **Used**: each overridden component behaves as if it shipped one more style function — the same cost class as its existing `sizeVariants`/`colorStyle` functions. Emotion caches by serialized output, so unchanged overrides reuse their class after the first render.
