Parse `$ARGUMENTS` as two space-separated words:

- **Word 1** — component name (`<Name>`). Must be PascalCase.
- **Word 2** — target directory (`<dir>`). Must be one of: `theme` · `common` · `page` · `section`.

If either word is missing or invalid, stop and say:

> "Usage: `/component <PascalCaseName> <theme|common|page|section>`"

---

## Directory mapping

| `<dir>`   | Root path                            |
| --------- | ------------------------------------ |
| `theme`   | `packages/design-system/src/<Name>/` |
| `common`  | `src/common/<Name>/`                 |
| `page`    | `src/pages/<Name>/`                  |
| `section` | `src/section/<Name>/`                |

---

## Step 0 — Read reference files

Read ALL of these before doing anything else — they are the authoritative source of truth:

1. `packages/design-system/design-system.md` — architecture rules
2. `.claude/skills/theme-usage/SKILL.md` — rules for consuming theme primitives in non-theme components
3. `.claude/skills/css-in-js/SKILL.md` — CSS-in-JS and styled-system conventions
4. `.claude/skills/code-style/SKILL.md` — TypeScript and JavaScript coding conventions
5. `.claude/skills/wcag/SKILL.md` — accessibility rules (ARIA, contrast, keyboard, landmarks)
6. `src/section/section.md` — section conventions (read only when `<dir>` is `section`)

---

## Step 1 — Detect mode

Check whether `<root-path>` already exists.

- **Exists** → **rework**. Read all existing files in the folder, then go to Step 4 (rework rules apply). Skip Steps 2–3.
- **Does not exist** → **new component**. Follow all steps in order.

---

## Step 2 — Clarify intent (new components only)

If the task spec (everything in `$ARGUMENTS` after the two required words) already makes the component's purpose, base element, and props clear, state your interpretation explicitly and proceed.

Otherwise ask:

> What is `<Name>`'s primary purpose and base HTML element?
> (e.g. `"section — a page region with a heading and body"`)

Do not generate any files until you have enough information to make concrete decisions.

---

## Step 3 — Audit for reuse

Before writing any code, scan for existing work that should be reused instead of duplicated:

**Theme primitives** — check `@soroush.tech/design-system/` for components that cover the layout or styling need:

- Block container → `View`
- Flex layout → `Flex`
- Grid layout → `Grid`
- Text → `Typography`
- Elevated surface → `Paper`
- Clickable → `Button`
- Input → `TextInput`

If a theme primitive covers the need, use it as a composed child — never reimplement it.

**Utils** — grep `src/utils/` and all sibling component folders for functions that match the logic needed. If a match exists, import it. If it lives in another component's folder (`src/common/OtherComponent/utils.ts`), present a proposal to move it to `src/utils/` and wait for approval before touching that file.

**Hooks** — grep `src/hooks/` and sibling component folders for hooks that match. Same rule: if a hook is generic enough to share, propose moving it to `src/hooks/` first.

Present a short summary of what you found and what you plan to reuse before proceeding.

---

## Step 4 — Generate files

Every component lives in its own folder regardless of `<dir>`. Create `<root-path>` with these files:

### `index.ts` — barrel re-export only

```ts
export * from './<Name>'
```

### `<Name>.tsx` — component

Rules that apply to **all** `<dir>` values:

- Compose using theme primitives (`View`, `Flex`, `Typography`, `Button`, etc.) — pass layout, color, and spacing via their token props, not inline styles.
- Never pass raw hex values, pixel literals, or hardcoded font-family strings.
- Extract reusable pure functions to `<Name>/utils.ts`. Extract stateful logic to `<Name>/use<Name>.ts` (or a more specific name). Keep `<Name>.tsx` a thin composition layer.
- Do **not** write custom CSS (`styled`, template literals, or `css` prop) without first presenting a proposal that explains why a theme primitive cannot cover the case. Wait for approval before implementing.
- **Assets:** SVG icons and images used by the component must be placed in `src/assets/` (icons in `src/assets/icons/`), not inlined or co-located next to the component.

**If `<dir>` is `theme`** — additionally follow all `packages/design-system/design-system.md` rules:

- `styled` base with `createShouldForwardProp([...props, ...customProps])`
- Custom props wired via `system()` against theme scales
- Prop types derived from `Theme` (`keyof Theme['scaleName']`) — no manual unions
- Export all prop types

**If `<dir>` is `common`, `page`, or `section`:**

- Compose from theme primitives; reach for `styled` only when a theme primitive genuinely cannot cover the case (and only after proposal + approval)
- Export prop types as a named interface

**Multi-prop variant pattern (theme components):**

For components where a prop selects a palette (not a raw CSS property), use a nested theme scale:

```ts
// themes.ts
button: Record<'primary' | 'secondary' | ..., { main, hover, active, contrast }>
```

- Derive type via `keyof Theme['button']` — never a manual union
- Use a `variantStyles` function, not `system()` — `system()` handles 1:1 prop→CSS; nested/conditional mappings need a function
- Hover/active states: hex-opacity suffix `${main}14` (8%) or `${main}20` (12%)

**Kinetic OS design tokens for interactive elements:**

Buttons use `borderRadius: 0`, `textTransform: uppercase`, `fontWeight: bold`, `letterSpacing: tight`. Contrast text on primary contained = `kineticGreen[800]`.

### Typography and sizing

When a layout calls for a specific font size, weight, or line height, match it to the nearest `Typography` variant or theme token prop (`fontSize`, `fontWeight`, `lineHeight` from `theme.fontSizes`, `theme.fontWeights`, `theme.lineHeights`). State the mapping explicitly:

> "I'm using `variant="body2"` (14px, normal weight) — does that match the intended style?"

Wait for confirmation before committing to a specific variant or size token.

### `<Name>.test.tsx` — unit tests

- Wrap every render in `renderWithTheme` (or `ThemeProvider`).
- Cover: children render, each meaningful prop produces the correct CSS or DOM output, HTML attribute passthrough (`className`, `data-*`, `aria-*`), element mapping if a variant prop exists.
- For `common` / `page` / `section` components: cover integration with child theme components (e.g. correct token is passed, correct text is rendered).

**jsdom caveats (theme components):**

- `backgroundColor` transparent value will convert to rgba
- Elements with `visibility: hidden` are excluded from accessible name — use `data-testid` selectors

### `README.md` — prop documentation

- Document every prop: type, default, description.
- Color / bg / border tables use palette constant names only — `kineticGreen[500]`, never hex.
- Include a usage example.
- Keep in sync with actual token values in `themes.ts`.

### `<Name>.stories.tsx` — Storybook (required for `theme`; optional but recommended for `common` / `section`)

- Import option arrays from `@soroush.tech/design-system/utils/test/storiesArgs.ts` and `@soroush.tech/design-system/utils/test/storiesOptions.ts` — never hardcode inline.
- `controls.include` whitelist — no autodiscovery.
- Every prop in `controls.include` must have a matching `argType` with `control`, `description`, and `table.category`.
- Category names: Content · Typography · Layout · Visual · Spacing.
- No top-level `name:` in any argType. `table.name` inside `table:` is safe — only affects autodocs display.
- When adding new token arrays to the options file, constrain with `satisfies`: `export const myTokens = [...] satisfies MyToken[]`
- Control types: `opacity` → `{ type: 'range', min: 0, max: 1, step: 0.05 }` · space props → `{ type: 'select' }, options: spaceTokens` · booleans → `'boolean'`

### `utils.ts` (create only if needed)

Extract to this file: pure functions with no React or theme dependency. If a function is generic (could be used outside this component), present a proposal to place it in `src/utils/` instead and wait for approval.

### `use<Name>.ts` (create only if needed)

Extract to this file: stateful logic (state, effects, refs, derived values). If the hook is generic, propose placing it in `src/hooks/` and wait for approval.

### `<Name>.data.ts` (create only if needed)

Static data the component renders. Co-locate it here and import it into both `<Name>.tsx` and `<Name>.test.tsx` so the test iterates the real data. Move to `src/utils/` only if the data is shared by more than one component.

---

## Step 5 — Custom CSS proposal gate

If at any point you determine that custom CSS is necessary (a theme primitive genuinely cannot cover a visual requirement), stop and present a proposal:

> **Custom CSS proposal**
>
> - **What:** `[describe the CSS rule]`
> - **Why a theme primitive won't work:** `[explain concisely]`
> - **Proposed implementation:** `[show the minimal code]`

Do not write the CSS until the user approves.

---

## Step 6 — Cross-component impact

After generating all files, check whether the changes affect other components:

- If you created or modified a shared util or hook, list every component that imports it.
- If you moved a util or hook from a component folder to `src/utils/` or `src/hooks/`, list the original consumer and confirm the import path was updated.
- Present findings as a short impact list before closing.

---

After all files are written, confirm:

1. Files created / modified
2. Reused utils / hooks (with import paths)
3. Any proposals still pending approval
4. Any outstanding coverage gaps
