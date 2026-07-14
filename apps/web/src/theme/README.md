# Theme

The design system for the web app: an Emotion + @soroush.tech/styled-system component library with token-driven `light` and `dark` themes. Every visual primitive used in `common/`, `section/`, and `pages/` comes from here.

The library takes inspiration from [Material UI](https://mui.com/) — its component vocabulary and prop conventions will feel familiar — but it is written entirely in house. It is not a clone or a fork: every component is built from scratch on our own engine and token system, and the API is free to diverge wherever it serves this project better.

For the conventions every component must follow (prop typing, `system()` wiring, `shouldForwardProp`, Storybook rules, testing), read **[`design-system.md`](./design-system.md)** — this README is the map, that file is the law.

---

## Importing

Always import through the path alias, never relative paths:

```ts
import { Typography } from 'src/theme/Typography'
import { Flex } from 'src/theme/Flex'
```

Styling primitives (the engine) come from the barrel `src/theme/index.ts` — `styled`, `css`, `keyframes`, `useTheme`, the `Theme` type, styled-system functions, and `createShouldForwardProp`. The barrel is the engine abstraction layer: to swap the CSS-in-JS engine, only that file changes.

```ts
import { styled, css, useTheme, type Theme } from 'src/theme'
```

---

## Folder map

| Path               | What it is                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `index.ts`         | Engine barrel — Emotion + `@soroush.tech/styled-system` re-exports                                                             |
| `themes.ts`        | `light` and `dark` theme objects implementing the `Theme` interface; no hardcoded hex values                                   |
| `globalStyles.ts`  | Global CSS applied by `ThemeProvider`                                                                                          |
| `colors/`          | Palette files (`kineticGreen`, `kineticSurface`, `cyberCyan`, `neonRed`, `solarAmber`, …) — the only place hex values may live |
| `hooks/`           | `useTheme`, `useThemeMode`, `useStyle`, `withTheme`, `withStyles`, `StylesConsumer`                                            |
| `utils/`           | Style helpers — `alpha`, `spacing`, `clamp`, `luminance`, `generateBoxShadow`, `styleCache`                                    |
| `utils/test/`      | `storiesOptions.ts` (token option arrays) and `storiesArgs.ts` (pre-built argTypes) for Storybook                              |
| `design-system.md` | Architecture and conventions for building components                                                                           |
| `ComponentName/`   | One folder per component (see inventory below)                                                                                 |

Every component folder contains `index.ts` (barrel), `ComponentName.tsx`, `README.md` (prop reference), `ComponentName.stories.tsx`, and `ComponentName.test.tsx`. Each component's own README documents its full prop API.

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

| Component      | Purpose                                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Typography`   | Text with variant → element mapping — the reference implementation for all components                                                                                                                                      |
| `Link`         | Anchor with theme-aware styling                                                                                                                                                                                            |
| `Icon`         | Icon renderer                                                                                                                                                                                                              |
| `Image`        | Image with styled-system props                                                                                                                                                                                             |
| `Avatar`       | User/entity avatar                                                                                                                                                                                                         |
| `Table`        | Compound data table — exports `TableContainer`, `TableHead`, `TableBody`, `TableFooter`, `TableRow`, `TableCell`, `TablePagination`, `TablePaginationActions`, `TableSortLabel`, and `TableControl` from `src/theme/Table` |
| `CodeBlock`    | Scrollable fenced-code surface with a copy-to-clipboard button                                                                                                                                                             |
| `Markdown`     | Headless markdown editor + renderer — exports `Control`, `Toolbar`, `Editor`, and `Preview` from `src/theme/Markdown`                                                                                                      |
| `ColorPalette` | Renders palette swatches (docs/Storybook aid)                                                                                                                                                                              |

### Inputs & forms

| Component                                            | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `Button`, `ButtonGroup`, `ToggleButton`              | Actions and toggles                           |
| `TextInput`                                          | Text field                                    |
| `Checkbox`, `Radio`, `Switch`                        | Selection controls                            |
| `NativeSelect`                                       | Platform `<select>`                           |
| `Select`                                             | Custom select built on `Popover` + `MenuItem` |
| `MenuItem`                                           | Option row for `Select`'s listbox             |
| `Field`                                              | Composed input field                          |
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

## Adding a component

Scaffold with the skill — it reads the live `Typography` files and `design-system.md` so output matches the codebase:

```
/new_theme_component ComponentName
```

Then work through the checklist at the bottom of [`design-system.md`](./design-system.md).
