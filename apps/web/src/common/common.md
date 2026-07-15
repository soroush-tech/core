# Common Components

Conventions for everything in `src/common/`. These components form the app shell and shared UI above the design system but below the page layer.

---

## What belongs here

`src/common/` is for **shared UI components** — building blocks that are reused across multiple pages or that assemble the app shell (header, footer, layout, navigation).

| Belongs in `src/common/`                               | Belongs elsewhere                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Reusable UI components (`Header`, `Footer`, `NavLink`) | Page-specific UI → `src/pages/`                                     |
| App shell components (`Layout`, `Bootstrap`, `Routes`) | Design primitives (`Flex`, `View`) → `@soroush.tech/design-system/` |
| Feature components used across pages (`DomainCard`)    | Utility functions and data → `src/utils/`                           |

**`src/common/` is UI — but a component's own data and logic stay with it.** Co-locate a component's static data (`ComponentName.data.ts`), pure helpers (`utils.ts` / `const.ts`, or a flat `utils/` folder), and component-specific hooks (`hooks/useX.ts`) inside its folder. Move a helper, hook, or data set to `src/utils/` or `src/hooks/` only once it is generic — used by more than one component.

---

## Folder structure

Every component gets its own folder. No flat component files at the `src/common/` root level.

```
src/common/
  ComponentName/
    index.ts                    ← export * from './ComponentName'
    ComponentName.tsx           ← component + exported prop types
    ComponentName.test.tsx      ← unit tests
    ComponentName.data.ts       ← co-located static data (optional)
    const.ts                    ← component-specific constants (optional)
    utils.ts                    ← helpers; or a utils/ folder of flat per-helper files (optional)
    hooks/useX.ts               ← component-specific hooks, flat files (optional)
    README.md                   ← prop and behaviour documentation
    ComponentName.stories.tsx   ← Storybook stories
```

The `index.ts` barrel keeps all import paths stable as components grow.

---

## Component conventions

### Composition over primitives

Always compose theme primitives. Never use raw HTML elements for layout or colour:

```tsx
// ✅
<Flex flexDirection="column" gap={2}>
  <Typography variant="body2" color="secondary">{text}</Typography>
</Flex>

// ❌
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <p style={{ color: '#999' }}>{text}</p>
</div>
```

Available primitives: `View`, `Flex`, `Grid`, `Typography`, `Link`, `Button`, `Paper`, `Image` — import from `@soroush.tech/design-system/`.

### Custom CSS

`styled(ThemeComponent)` is allowed for behaviour that cannot be expressed through theme primitive props:

- Pseudo-selectors (`:hover`, `::before`, `::after`)
- Keyframe animations
- Fluid font sizing (`clamp()`)
- Descendant selectors (`img`, `span` inside a card)
- CSS properties with no styled-system equivalent (`text-shadow`, `filter`, `transition`)

Always include a comment explaining why the custom CSS is necessary:

Label every `styled()` call with `{ label: 'ComponentName' }` so Emotion class names are readable in DevTools.

### No hardcoded colours

All colours reference theme tokens. Opacity uses the hex-suffix pattern:

```tsx
// ✅
color: ${({ theme }) => theme.text.primary}80   // 50% opacity

// ❌
color: rgba(0, 252, 64, 0.5)
color: '#00FC40'
```

### Prop types

Export prop interfaces so consumers and stories can import them:

```tsx
export interface DomainCardProps {
  title: string
  featured?: boolean
}
```

Extend HTML attributes when the component wraps a native element or accepts passthrough props:

```tsx
export interface NavLinkProps extends LinkProps {}
```

### Logic & data co-location

Keep `ComponentName.tsx` a thin composition layer. Extract:

- Pure functions → `utils.ts`, or a flat `utils/` folder with one file per helper (`utils/helperName.ts` + co-located `utils/helperName.test.ts`) when there are several (constants → `const.ts`)
- Stateful logic → `hooks/useX.ts` (flat file + co-located `useX.test.ts`; no per-hook subfolder)
- Static data → `ComponentName.data.ts`, imported by both the component and its test so tests iterate the real data

All of these stay **co-located in the component folder**. Promote to `src/utils/` or `src/hooks/` only when the helper, hook, or data set becomes generic (used by more than one component).

---

## Testing conventions

Wrap every render in `renderWithTheme` from `src/test/utils/wrapper`:

```tsx
import { renderWithTheme } from 'src/test/utils/wrapper'

it('renders the title', () => {
  renderWithTheme(<DomainCard title="Systems" {...requiredProps} />)
  expect(screen.getByText('Systems')).toBeInTheDocument()
})
```

Minimum coverage per component:

| Test type   | What to cover                                                  |
| ----------- | -------------------------------------------------------------- |
| Render      | Children / text content appears in the DOM                     |
| Behaviour   | State changes, active states, conditional rendering            |
| Props       | Key props produce the expected output or class                 |
| Passthrough | `className`, `style`, `data-*`, `aria-*` reach the DOM element |

---

## Storybook conventions

Follow the same story structure as `@soroush.tech/design-system/` components:

- Import option arrays from `@soroush.tech/design-system/utils/test/storiesOptions.ts` — never hardcode inline
- Use `controls.include` whitelist — no autodiscovery
- Every prop in `controls.include` must have a matching `argType` with `control`, `description`, and `table.category`
- Category names: **Content · Layout · Visual · Behaviour · Spacing**

---
