# Design System

How the theme is built, how components are structured, and the conventions every component must follow.

---

## Stack

| Concern                   | Library                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| CSS-in-JS                 | `@emotion/styled` + `@emotion/react`                                   |
| Theme tokens              | `styled-system` (space, layout, typography, flexbox, border, position) |
| Custom prop→scale mapping | `styled-system` `system()`                                             |
| Prop filtering            | `@styled-system/should-forward-prop`                                   |
| Component stories         | Storybook v9 (`@storybook/react-vite`)                                 |
| Theme augmentation        | `@types/emotion_react/index.d.ts`                                      |

---

## Theme

`src/theme/themes.ts` exports `light` and `dark`, both implementing the `Theme` interface. There are no hardcoded hex values in `themes.ts` — every value references a palette constant from `src/theme/colors/`.

### Palette files (`src/theme/colors/`)

| File                | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `kineticSurface.ts` | Dark neutral stack — backgrounds, surfaces |
| `kineticGreen.ts`   | Primary neon accent                        |
| `cyberCyan.ts`      | Secondary accent / info                    |
| `neonRed.ts`        | Error / destructive                        |
| `solarAmber.ts`     | Warning                                    |
| `carbonBlack.ts`    | Deep terminal blacks                       |

Rgba opacity is expressed via hex suffix — `${kineticSurface[100]}B3` = rgba(255,255,255,0.7). Never use `rgba()` strings directly.

### Theme scales

| Scale           | Key in Theme           | Prop type                       |
| --------------- | ---------------------- | ------------------------------- |
| Text colors     | `theme.text`           | `keyof Theme['text']`           |
| Backgrounds     | `theme.background`     | `keyof Theme['background']`     |
| Space           | `theme.space`          | `keyof Theme['space']`          |
| Font sizes      | `theme.fontSizes`      | index (number)                  |
| Font weights    | `theme.fontWeights`    | `keyof Theme['fontWeights']`    |
| Line heights    | `theme.lineHeights`    | `keyof Theme['lineHeights']`    |
| Letter spacings | `theme.letterSpacings` | `keyof Theme['letterSpacings']` |
| Fonts           | `theme.fonts`          | `keyof Theme['fonts']`          |
| Radii           | `theme.radii`          | `keyof Theme['radii']`          |

### Theme augmentation

`@types/emotion_react/index.d.ts` merges the custom `Theme` into `@emotion/react`'s `Theme` interface. This means `Theme` imported from `@emotion/react` is the full custom theme — no separate import needed.

```ts
import { type Theme } from '@emotion/react'

type MyColorProp = keyof Theme['text'] // 'inherit' | 'initial' | 'primary' | ...
type MyBgProp = keyof Theme['background'] // 'backdrop' | 'modal' | 'primary' | ...
```

---

## Component Architecture

**Every component lives in its own folder** `src/theme/ComponentName/` with: `index.ts` (`export * from './ComponentName'`) · `ComponentName.tsx` · `README.md` · `ComponentName.stories.tsx` · `ComponentName.test.tsx`

**Prop types** — derive from `Theme` (imported from `@emotion/react`, which is augmented via `@types/emotion_react/index.d.ts`), never write manual unions:

- `color?: keyof Theme['text']`
- `bg?: keyof Theme['background']`
- Font/space scales → `keyof Theme['fontWeights']` etc.

**Custom props → theme scales** — wire through `system()` in `@emotion/styled`. Key mappings:

- `color` → `scale: 'text'`
- `bg` → `scale: 'background'`

**Storybook options** — all option arrays live in `src/theme/test/utils/storiesOptions.ts` with `satisfies` constraints against `Theme`. Import from there in every story, never hardcode inline. When adding a new component, add its token arrays to `storiesOptions.ts`.

**Storybook argType rules:**

- Always use `controls.include` whitelist — never rely on autodiscovery
- Every prop in `controls.include` **must** have a matching `argType` entry — missing argTypes cause the control to silently disappear or leak raw props to the DOM. Verify the lists match before finishing a story.
- Do NOT use top-level `name:` in argTypes (breaks `controls.include` matching)
- Always add `table.category` — use: Content · Typography · Layout · Visual · Spacing · Behavior · Focus — make sure it matches the category; if unsure, suggest a name and verify before implementing.

**No hardcoded hex values** anywhere in `src/theme/` — all colors reference palette constants from `src/theme/colors/`. Rgba opacity uses hex suffix pattern: `${kineticSurface[100]}B3`.

**`Typography` is the reference implementation** — follow its structure for every new component.

**To scaffold a new component** — use the `/new_theme_component` skill:

```
/new_theme_component Button
```

This reads the current Typography files and `design-system.md` before generating, so output always matches the live codebase. It creates all four required files and updates `storiesOptions.ts` if new token arrays are needed.

### 1. Prop interface

Extend the styled-system prop groups and declare custom props. Derive types from `Theme` — never write manual unions.

```ts
import { type Theme } from '@emotion/react'

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

Every component lives in its own folder under `src/theme/`. The folder contains four files plus a barrel index:

```
src/theme/
  ComponentName/
    index.ts               ← export * from './ComponentName'
    ComponentName.tsx      ← component + exported prop types
    README.md              ← prop reference documentation
    ComponentName.stories.tsx ← Storybook stories
    ComponentName.test.tsx ← unit tests
```

The `index.ts` barrel means all existing imports (`import { X } from 'src/theme/ComponentName'`) continue to work without changes — Node/TypeScript resolves the folder to its `index.ts` automatically.

### `README.md`

Documents every prop the component accepts. Rules:

- Color tables show palette source names only — `kineticGreen[500]`, not `#00FF41`
- Keep in sync with actual values in `themes.ts` — the README is the source of truth for consumers
- Include all styled-system prop groups the component supports

### `ComponentName.stories.tsx`

Import all option arrays from `src/theme/test/utils/storiesOptions.ts`. Never hardcode arrays inline in a story file.

```ts
import {
  textColorTokens,
  backgroundTokens,
  spaceTokens,
  fontWeightTokens,
  // ... others as needed
} from 'src/theme/utils/test/storiesOptions'
```

ArgType categories — use exactly these names for consistency across all components:

| Category       | What goes here                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Content**    | `children` and content-related props                                                                                                |
| **Typography** | `variant`, `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`                                       |
| **Layout**     | `align`, `gutterBottom`, `noWrap`, `as`, `display`, `overflow`                                                                      |
| **Color**      | `color`, `bg`, `opacity`                                                                                                            |
| **Spacing**    | `m`, `p` (and directional variants if exposed)                                                                                      |
| **Behavior**   | Mount/scroll-lock/portal toggles and targets — `shouldKeepMounted`, `shouldLockScroll`, `shouldUsePortal`, `isEnabled`, `container` |
| **Focus**      | Focus-management toggles — `shouldAutoFocus`, `shouldTrapFocus`, `shouldEnforceFocus`, `shouldRestoreFocus`                         |

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

## Storybook Options (`src/theme/utils/test/storiesOptions.ts`)

For props shared across components (`bg`, `opacity`, `p`, `m`, all border props, etc.), `src/theme/utils/test/storiesArgs.ts` exports pre-built argType objects — import and spread directly into `argTypes` instead of composing from option arrays.

Single source of truth for all option arrays used in Storybook stories. Add new arrays here when building new components. Each array uses `satisfies` to stay in sync with the Theme type — TypeScript will error if a key is missing or misspelled.

```ts
// Adding a new token array:
export const radiiTokens = ['sm', 'md', 'lg'] satisfies (keyof Theme['radii'])[]
```

Import the relevant prop types from the component file to constrain component-specific arrays:

```ts
import type { BackgroundToken, TextColorToken } from 'src/theme/Typography'

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
- [ ] New token arrays added to `src/theme/test/utils/storiesOptions.ts` with `satisfies`
- [ ] `ComponentName/ComponentName.test.tsx` — prop→CSS, element mapping, HTML passthrough
- [ ] No hardcoded hex values anywhere in `src/theme/`
