# Section Components

Conventions for everything in `src/section/`. Sections are large, page-specific UI blocks that are too complex to live inline in a `+Page.tsx` file but are **not reused** across pages.

---

## What belongs here

`src/section/` is for **page-specific sections** — self-contained UI regions that belong to exactly one page.

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

Storybook stories are optional for sections — they are large, page-specific compositions that are better verified via e2e tests.

---

## Component conventions

Identical to `src/common/` rules:

- Compose from theme primitives (`View`, `Flex`, `Typography`, `Button`, etc.) — a section may also compose `src/common/` components
- All colours via theme tokens — no hardcoded hex
- Custom CSS (`styled`) only when theme primitives cannot cover the need, with a comment explaining why
- Export prop interfaces so `+Page.tsx` can import types if needed
- Extract logic and data the same way as `src/common/`: pure helpers → `utils.ts` (or a flat `utils/` folder, one file per helper + co-located test, when there are several), stateful logic → `hooks/useX.ts` (flat file + co-located test), static data → `SectionName.data.ts` — all co-located. Promote to `src/utils/` or `src/hooks/` only when generic.

---

## Layout standard

Every section uses the same two-layer layout so pages stay visually consistent and
responsive across **tablet and desktop**. This is not optional — match it exactly.

### 1. Section root — a full-bleed band

Use a semantic `View` (or `Flex`) with `as="section"`. **Never use `Paper` as the section
root, and never fake a surface with `bg="paper"` on the root.** `Paper` is only for a
genuine elevated card _inside_ the content container.

```tsx
<View as="section" py={10} px={4}>
```

- `px={4}` — consistent horizontal gutter on every section.
- `py` — vertical rhythm, `6`–`10` depending on density.
- `bg` — set a surface token (`terminal`, `default`) only when the section needs a banded
  background; otherwise leave the root transparent.

### 2. Content container — constrained and centered

Wrap the section's content in a container capped at **`maxWidth="1280px"`** and centered
with **`mx="auto"`**. Put it on a `View`, or directly on the `Flex`/`Grid` that lays out
the content.

```tsx
<View as="section" py={10} px={4}>
  <View maxWidth="1280px" mx="auto">
    {/* content */}
  </View>
</View>
```

### 3. Responsive — mobile-first, always cover tablet and desktop

Column counts, gaps, and sizes use styled-system responsive arrays `[mobile, tablet, desktop]`.
Every multi-column layout **must define a tablet _and_ a desktop value** — never ship a
layout that only adapts at a single breakpoint.

```tsx
<Grid gridTemplateColumns={['1fr', '1fr 1fr', 'repeat(4, 1fr)']} gap={6}>
```

| Index | Viewport | Breakpoint |
| ----- | -------- | ---------- |
| 0     | mobile   | base       |
| 1     | tablet   | ≥ 40em     |
| 2     | desktop  | ≥ 52em     |

---

## Testing

- Unit test the React surface with `renderWithTheme` (`SectionName.test.tsx`) — heading, content, toggles, conditional rendering.
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
