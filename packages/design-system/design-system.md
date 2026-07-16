# Design System

How the theme is built, how components are structured, and the conventions every component must follow.

---

## Stack

| Concern                   | Library                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| CSS-in-JS                 | `@emotion/styled` + `@emotion/react` (internal only — see `src/engine.ts`)                                        |
| Theme tokens              | `styled-system` (space, layout, typography, flexbox, border, position)                                            |
| Custom prop→scale mapping | `styled-system` `system()`                                                                                        |
| Prop filtering            | `@styled-system/should-forward-prop`                                                                              |
| Component stories         | Storybook v10 (`@storybook/react-vite`)                                                                           |
| Theme augmentation        | native interfaces owned by `src/themes.ts`, augmentable via `declare module '@soroush.tech/design-system/themes'` |

---

## Theme

`@soroush.tech/design-system/themes.ts` exports `baseTheme` — one complete, dark-schemed default `Theme`. Its color values are raw hex literals: palettes belong to the consumer, who owns the brand color files and builds every brand theme with `createTheme(baseTheme, …)` (this site's palettes and `light`/`dark` themes live in `apps/web/src/theme/`). Components must never hardcode colors — they read theme tokens only; `baseTheme` is the single place in the package where hex values are allowed.

Rgba opacity is expressed via hex suffix — `#FFFFFFB3` = rgba(255,255,255,0.7). Never use `rgba()` strings directly.

### Theme scales

Each scale is a named, consumer-extensible interface (declared in `src/themes.ts`); the `Theme` composition wraps them in `OpenScale<…>` mapped types so styled-system's Record-based constraint is satisfied while `keyof` keeps the literal keys.

| Scale           | Key in Theme           | Interface                 | Prop type                       |
| --------------- | ---------------------- | ------------------------- | ------------------------------- |
| Defaults        | `theme.defaults`       | `ThemeDefaults`           | — (component prop fallbacks)    |
| Palette         | `theme.palette`        | `ThemePalette`            | `PaletteColor`                  |
| Text colors     | `theme.text`           | `ThemeText`               | `keyof Theme['text']`           |
| Backgrounds     | `theme.background`     | `ThemeBackground`         | `keyof Theme['background']`     |
| Borders         | `theme.border`         | `ThemeBorder`             | `keyof Theme['border']`         |
| Space           | `theme.space`          | `ThemeSpace`              | `keyof Theme['space']`          |
| Sizes           | `theme.sizes`          | `ThemeSizes`              | `keyof Theme['sizes']`          |
| Font sizes      | `theme.fontSizes`      | `number[]`                | index (number)                  |
| Font weights    | `theme.fontWeights`    | `ThemeFontWeights`        | `keyof Theme['fontWeights']`    |
| Line heights    | `theme.lineHeights`    | `ThemeLineHeights`        | `keyof Theme['lineHeights']`    |
| Letter spacings | `theme.letterSpacings` | `ThemeLetterSpacings`     | `keyof Theme['letterSpacings']` |
| Fonts           | `theme.fonts`          | `ThemeFonts`              | `keyof Theme['fonts']`          |
| Radii           | `theme.radii`          | `ThemeRadii`              | `keyof Theme['radii']`          |
| Typography      | `theme.typography`     | `ThemeTypographyVariants` | `TypographyVariant`             |
| Icon sizes      | `theme.icon`           | `ThemeIconSizes`          | `keyof Theme['icon']`           |
| Switch tokens   | `theme.switch`         | `ThemeSwitch`             | —                               |
| Shadow tokens   | `theme.shadow`         | `ThemeShadow`             | —                               |
| Syntax          | `theme.syntax`         | `ThemeSyntax`             | —                               |

### Theme augmentation

The entire type layer is declared natively — as plain exported interfaces owned by this package — in `src/themes.ts`. `Theme` is this package's own type, not Emotion's: Emotion is an internal implementation detail (see `src/engine.ts`) and is never part of the public type surface. `declare module '@soroush.tech/design-system/themes'` is the augmentation surface consumers use to extend scales by declaration merging; it survives tsdown's chunked d.ts output the same way augmenting an external module used to (verified by `type-tests/augmentation.ts`).

```ts
import { type Theme } from '@soroush.tech/design-system/themes'

type MyColorProp = keyof Theme['text'] // 'inherit' | 'initial' | 'primary' | ...
type MyBgProp = keyof Theme['background'] // 'backdrop' | 'modal' | 'primary' | ...
```

**Consumers of the published package** extend scales by augmenting `@soroush.tech/design-system/themes` (see the README's "Theming" section), build the values with `createTheme(base, overrides)`, and pass the finished theme to `ThemeProvider`'s `theme` prop. `type-tests/augmentation.ts` (run by `pnpm test:types`) verifies this recipe against the real dist d.ts.

**The in-repo app must NOT augment scale interfaces with new keys** — the monorepo consumes package _source_, so a merged required key would fail the `light: Theme` completeness check inside `src/themes.ts`. The app only overrides values (`apps/web/src/theme/themes.ts` via `createTheme`).

**New scale interfaces must be declared natively in `src/themes.ts`** (not inside a `declare module` block — this package owns them outright), so member identity stays stable across d.ts chunks.

### Per-component customization (`theme.components`)

Full consumer guide: [`docs/customization.md`](./docs/customization.md); theming overview: [`docs/theming.md`](./docs/theming.md).

The engine `styled` (in `src/styled.ts`, re-exported from the barrel) accepts `name`/`slot`/`systemProps` options. A named root reads `theme.components[name]` and appends the matching `styleOverrides[slot]` and `variants` after the component's own styles — but before `systemProps`, so per-instance props always win. Zero-config themes bail out on the first check.

Rules when converting a component:

- Pass `name` (the `ThemeComponents` key) on the root, and `slot` on named sub-elements (`label`, `icon`, …). Slot names are public API — renaming one is a breaking change.
- Move the styled-system parsers (`space`, `layout`, …) from the style arguments into the `systemProps` option so instance props keep beating theme overrides.
- Resolve `defaultProps` via `useDefaultProps(name)` in the wrapper, in the standard chain: explicit prop → group context → `defaultProps` → `theme.defaults.*` → literal fallback.
- Type the component's entry in `ThemeComponents` (`ComponentConfig<OwnerState, Slots>`) and, if it has variants, expose them via an augmentable interface (see `ButtonVariants`).

`Button` is the reference implementation; `Theme/Customization` in Storybook is the living contract, locked by Chromatic.

**Every styled element is named** — every `styled(...)` call in the package carries a `name` (roots) or `name` + `slot` (sub-elements), including the layout primitives `View`/`Flex`/`Grid`. The full key/slot list is the `ThemeComponents` interface in `src/themes.ts`, and `src/themeComponents.spec.tsx` locks each element's `styleOverrides` wiring. `pnpm audit:styled` regenerates `styled-audit.md` and reports any call that loses its `name` (`--check` exits non-zero); intentional omissions must carry `// audit-styled-ignore: <reason>` on the preceding line. Beware that an override on `View`/`Flex`/`Grid` cascades into the internals of every composed component — that reach is deliberate, so use those keys for app-wide policy only.

---

## Component Architecture

**Every component lives in its own folder** `packages/design-system/src/ComponentName/` with: `index.ts` (`export * from './ComponentName'`) · `ComponentName.tsx` · `README.md` · `ComponentName.stories.tsx` · `ComponentName.test.tsx`

**Prop types** — derive from `Theme` (this package's own type, owned by `src/themes.ts` — Emotion is internal-only), never write manual unions:

- `color?: keyof Theme['text']`
- `bg?: keyof Theme['background']`
- Font/space scales → `keyof Theme['fontWeights']` etc.

**Custom props → theme scales** — wire through `system()` in `@emotion/styled`. Key mappings:

- `color` → `scale: 'text'`
- `bg` → `scale: 'background'`

**Storybook options** — all option arrays live in `@soroush.tech/design-system/utils/test/storiesOptions.ts` with `satisfies` constraints against `Theme`. Import from there in every story, never hardcode inline. When adding a new component, add its token arrays to `storiesOptions.ts`.

**Storybook argType rules:**

- Always use `controls.include` whitelist — never rely on autodiscovery
- Every prop in `controls.include` **must** have a matching `argType` entry — missing argTypes cause the control to silently disappear or leak raw props to the DOM. Verify the lists match before finishing a story.
- Do NOT use top-level `name:` in argTypes (breaks `controls.include` matching)
- Always add `table.category` — use: Content · Typography · Layout · Visual · Spacing · State · Progress · Behavior · Focus — make sure it matches the category; if unsure, suggest a name and verify before implementing.

**No hardcoded hex values in components** — all component colors read theme tokens; hex literals are allowed only inside `themes.ts` (`baseTheme`) and test/story fixtures. Rgba opacity uses the hex suffix pattern: `#FFFFFFB3`.

**`Typography` is the reference implementation** — follow its structure for every new component.

**To scaffold a new component** — use the `/new_theme_component` skill:

```
/new_theme_component Button
```

This reads the current Typography files and `design-system.md` before generating, so output always matches the live codebase. It creates all four required files and updates `storiesOptions.ts` if new token arrays are needed.

### 1. Prop interface

Extend the styled-system prop groups and declare custom props. Derive types from `Theme` — never write manual unions.

```ts
import { type Theme } from '@soroush.tech/design-system/themes'

// Derive from Theme — stays in sync automatically
export type TextColorToken  = keyof Theme['text']
export type BackgroundToken = keyof Theme['background']

export interface MyComponentProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    SpaceProps<Theme>,
    LayoutProps<Theme>,
    // ... other styled-system groups
  {
    color?: TextColorToken       // resolves → theme.text
    bg?: BackgroundToken         // resolves → theme.background
    opacity?: number             // raw CSS, no scale
  }
```

Export prop types — Storybook's `storiesOptions.ts` will import and use them in `satisfies` constraints.

### 2. Prop forwarding

Use `createShouldForwardProp` to prevent styled-system props from reaching the DOM:

```ts
const shouldForwardProp = createShouldForwardProp([
  ...props, // all styled-system props
  'myCustomProp', // any additional non-HTML props
])
```

### 3. Custom prop → theme scale

Wire props that don't have a built-in styled-system function through `system()`:

```ts
const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  opacity: { property: 'opacity' }, // no scale — raw CSS
})
```

The `scale` value must match a key in the `Theme` interface.

### 4. Styled base

```ts
const MyBase = styled('div', { shouldForwardProp })<MyComponentProps>(
  space,
  layout,
  colorSystem, // custom props before built-in typography so overrides work
  typography,
  flexbox,
  border,
  position,
  ({ customProp }) => (customProp ? {/* css */} : {})
)
```

### 5. Wrapper component

Use a wrapper when the rendered element needs to vary (e.g. `as` prop, variant mapping):

```ts
export function MyComponent({ as, ...rest }: MyComponentProps) {
  return <MyBase as={as} {...rest} />
}
```

---

## Files per Component

Every component lives in its own folder under `@soroush.tech/design-system/`. The folder contains four files plus a barrel index:

```
@soroush.tech/design-system/
  ComponentName/
    index.ts               ← export * from './ComponentName'
    ComponentName.tsx      ← component + exported prop types
    README.md              ← prop reference documentation
    ComponentName.stories.tsx ← Storybook stories
    ComponentName.test.tsx ← unit tests
```

The `index.ts` barrel means all existing imports (`import { X } from '@soroush.tech/design-system/ComponentName'`) continue to work without changes — Node/TypeScript resolves the folder to its `index.ts` automatically.

### `README.md`

Documents every prop the component accepts. Rules:

- Color tables show palette source names only — `kineticGreen[500]`, not `#00FF41`
- Keep in sync with actual values in `themes.ts` — the README is the source of truth for consumers
- Include all styled-system prop groups the component supports

### `ComponentName.stories.tsx`

Import all option arrays from `@soroush.tech/design-system/test/utils/storiesOptions.ts`. Never hardcode arrays inline in a story file.

```ts
import {
  textColorTokens,
  backgroundTokens,
  spaceTokens,
  fontWeightTokens,
  // ... others as needed
} from '@soroush.tech/design-system/utils/test/storiesOptions'
```

ArgType categories — use exactly these names for consistency across all components:

| Category       | What goes here                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content**    | `children` and content-related props — `src`, `srcSet`, `alt`, `href`, `placeholder`, `count`, `fallback`, `title`                                         |
| **Typography** | `variant`, `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`                                                              |
| **Layout**     | Sizing, alignment, and flow — `size`, `fullWidth`, `align`, `orientation`, `as`, `noWrap`, `gutterBottom`, `display`, `overflow`, grid/flex props          |
| **Visual**     | Visual style tokens — `color`, `bg`, `textColor`, `opacity`, `variant`, `elevation`, `borderRadius`, `shape`, `thickness`                                  |
| **Spacing**    | `m`, `p` (and directional variants if exposed)                                                                                                             |
| **State**      | Control state flags — `checked`, `disabled`, `error`, `required`, `readOnly`, `indeterminate`                                                              |
| **Progress**   | Progress values — `value`, `min`, `max`, `valueBuffer`                                                                                                     |
| **Behavior**   | Interaction and mount behavior — `shouldKeepMounted`, `shouldLockScroll`, `shouldUsePortal`, `isEnabled`, `container`, `page`, `multiple`, event callbacks |
| **Focus**      | Focus-management toggles — `shouldAutoFocus`, `shouldTrapFocus`, `shouldEnforceFocus`, `shouldRestoreFocus`                                                |

Rules:

- Always use `controls.include` whitelist — autodiscovery surfaces every HTML attribute
- Do **not** use top-level `name:` in an argType — it renames the arg key and breaks `controls.include` matching
- `table.name` inside the `table:` object is safe — only affects autodocs display

### `ComponentName.test.tsx`

Minimum coverage:

- Children render correctly
- Each custom prop applies the expected CSS
- HTML attribute passthrough (`className`, `data-*`, `aria-*`, `onClick`)
- Variant → element mapping (if applicable)

---

## Storybook Options (`@soroush.tech/design-system/utils/test/storiesOptions.ts`)

For props shared across components (`bg`, `opacity`, `p`, `m`, all border props, etc.), `@soroush.tech/design-system/utils/test/storiesArgs.ts` exports pre-built argType objects — import and spread directly into `argTypes` instead of composing from option arrays.

Single source of truth for all option arrays used in Storybook stories. Add new arrays here when building new components. Each array uses `satisfies` to stay in sync with the Theme type — TypeScript will error if a key is missing or misspelled.

```ts
// Adding a new token array:
export const radiiTokens = ['sm', 'md', 'lg'] satisfies (keyof Theme['radii'])[]
```

Import the relevant prop types from the component file to constrain component-specific arrays:

```ts
import type { BackgroundToken, TextColorToken } from '@soroush.tech/design-system/Typography'

export const backgroundTokens = [...] satisfies BackgroundToken[]
```

---

## Emotion Babel Plugin

The Babel plugin is configured with key `soroush`. In development, generated class names follow the pattern `soroush-[local]--[filename]`. This is expected — do not mistake it for a naming collision.

---

## Quick Checklist — New Component

Use `/new_theme_component ComponentName` to scaffold all files automatically.

- [ ] `ComponentName/index.ts` — `export * from './ComponentName'`
- [ ] `ComponentName/ComponentName.tsx` — styled base + wrapper, `shouldForwardProp`, `system()` for custom scales
- [ ] Prop types derived from `Theme` (`keyof Theme['scaleName']`), not manual unions
- [ ] Custom prop types exported for use in `storiesOptions.ts`
- [ ] `ComponentName/README.md` — all props documented, no hex codes
- [ ] `ComponentName/ComponentName.stories.tsx` — imports from `storiesArgs` (shared props) or `storiesOptions` (component-specific), `controls.include` whitelist, argType categories
- [ ] New token arrays added to `@soroush.tech/design-system/utils/test/storiesOptions.ts` with `satisfies`
- [ ] `ComponentName/ComponentName.test.tsx` — prop→CSS, element mapping, HTML passthrough
- [ ] No hardcoded hex values in the component — colors read theme tokens only
