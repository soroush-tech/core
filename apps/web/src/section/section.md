# Section Components

Conventions for everything in `src/section/`. Sections are large, page-specific UI blocks that are too complex to live inline in a `+Page.tsx` file but are **not reused** across pages.

---

## What belongs here

`src/section/` is for **page-specific sections** - self-contained UI regions that belong to exactly one page.

| Belongs in `src/section/`                         | Belongs elsewhere                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| Hero, Philosophy, Bento grid, CTA on the homepage | Reusable shell components (`Header`, `Footer`) → `src/common/`      |
| "Technical Stack" block on the about page         | Design primitives (`Flex`, `View`) → `@soroush.tech/design-system/` |
| "Open Source" section on the projects page        | Utility functions → `src/utils/`                                    |

**One page, one section.** If a section appears on more than one page, move it to `src/common/`.

---

## Folder structure

Every section gets its own folder under `src/section/`.

```
src/section/
  SectionName/
    index.ts                  ← export * from './SectionName'
    SectionName.tsx           ← component + exported prop types
    SectionName.data.ts       ← co-located static data (optional)
    const.ts                  ← section-specific constants (optional)
    utils.ts                  ← helpers; or a utils/ folder of flat per-helper files (optional)
    hooks/useX.ts             ← section-specific hooks, flat files (optional)
    SectionName.test.tsx      ← unit tests
    README.md                 ← prop and behaviour documentation
```

Storybook stories are optional for sections - they are large, page-specific compositions that are better verified via e2e tests.

---

## Component conventions

Identical to `src/common/` rules:

- Compose from theme primitives (`View`, `Flex`, `Typography`, `Button`, etc.) - a section may also compose `src/common/` components
- All colours via theme tokens - no hardcoded hex
- Custom CSS (`styled`) only when theme primitives cannot cover the need, with a comment explaining why
- Export prop interfaces so `+Page.tsx` can import types if needed
- Extract logic and data the same way as `src/common/`: pure helpers → `utils.ts` (or a flat `utils/` folder, one file per helper + co-located test, when there are several), stateful logic → `hooks/useX.ts` (flat file + co-located test), static data → `SectionName.data.ts` - all co-located. Promote to `src/utils/` or `src/hooks/` only when generic.

---

## Layout standard

Every section uses the same two-layer layout so pages stay visually consistent and
responsive across **tablet and desktop**. This is not optional - match it exactly.

### 1. Section root - a full-bleed band

Use a semantic `View` (or `Flex`) with `as="section"`. **Never use `Paper` as the section
root, and never fake a surface with `bg="paper"` on the root.** `Paper` is only for a
genuine elevated card _inside_ the content container.

```tsx
<View as="section" py={10}>
```

- No `px` - the inline margins come from the frame inside (step 2).
- `py` - vertical rhythm, `6`-`10` depending on density.
- `bg` - set a surface token (`terminal`, `default`) only when the section needs a banded
  background; otherwise leave the root transparent.

### 2. Content - on the theme's layout

The page frame (margins, max width) and the columns come from `theme.layout`
(`src/theme/themes.ts`), never from values written on the section. Follow the design
system's "Layout: one way per intent" table:

| Intent                       | Write                                        | Not                                     |
| ---------------------------- | -------------------------------------------- | --------------------------------------- |
| Content on the frame         | `<View layout>` / `<Flex layout>`            | `maxWidth` + `mx="auto"` + `px`         |
| Content on the columns       | `<Grid layout gap={N}>`                      | hand-written tracks, `Flex` with widths |
| A child taking N columns     | `span={{ xs: 4, md: 6 }}`                    | `gridColumn="span 6"`                   |
| A child taking the whole row | `span="full"`                                | `gridColumn: '1 / -1'`, `style`         |
| A narrower section           | `layout={{ mode: 'fixed', maxWidth }}`       | a nested `maxWidth` + `mx="auto"` box   |
| A grid with its own tracks   | a plain `Grid` (`auto-fill`, ...) in a frame | `layout` plus `gridTemplateColumns`     |

```tsx
<View as="section" py={10}>
  <Grid layout gap={2}>
    <View span="full">{/* heading */}</View>
    <View span={{ xs: 4, md: 6 }}>{/* half on desktop */}</View>
    <View span={{ xs: 4, md: 6 }}>{/* half on desktop */}</View>
  </Grid>
</View>
```

Never put `layout` on a wrapper around several sections (the page `Layout`, a page-wide
`Flex`): each frame would sit inside another and the margins would apply twice.

### 3. Responsive - mobile-first, always cover tablet and desktop

The theme has 4 columns at `xs`, 8 from `sm` and 12 from `md`. A `span` or other responsive
value set at a breakpoint holds from there up. Every multi-column layout **must define a
tablet _and_ a desktop value** - never ship a layout that only adapts at a single breakpoint.

---

## Testing

- Unit test the React surface with `renderWithTheme` (`SectionName.test.tsx`) - heading, content, toggles, conditional rendering.
- Import `SectionName.data.ts` into the test so it iterates the real data, not a fixture.
- Imperative or environment-dependent code (D3 force simulation, drag, zoom) that jsdom cannot run is marked `/* v8 ignore */` and validated by the page's Playwright spec (`src/pages/<route>/<route>.e2e.ts`).

---

## Naming

Name after the page and content role, not generic terms:

```
✓ Philosophy      ← homepage philosophy block
✓ TechStack       ← about page tech stack
✓ ProjectBento    ← homepage bento grid
✗ ProjectBentoSection    ← no extra long name
✗ Section1               ← meaningless
✗ HomepageBlock          ← too generic
```

---

## Usage in pages

Import directly into the relevant `+Page.tsx`:

```tsx
// src/pages/index/+Page.tsx
import { Hero } from 'src/common/Hero'
import { Philosophy } from 'src/section/Philosophy'
import { TechStack } from 'src/section/TechStack'

export default function Page() {
  return (
    <Layout>
      <Hero />
      <Philosophy />
      <TechStack />
    </Layout>
  )
}
```
