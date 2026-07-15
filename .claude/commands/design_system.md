The component name is the first word of `$ARGUMENTS`.
The remainder of `$ARGUMENTS` (if any) is the task spec — extract agreed props, behaviours, and constraints from it to inform Steps 2 and 3.

If the first word is not a valid PascalCase name, stop and say:

> "Please start with a PascalCase component name, e.g. `/design_system Button [optional task spec]`"

---

## Step 0 — Detect mode

Check whether `packages/design-system/src/<Name>/` already exists.

- **Exists** → this is a **rework** of an existing component. Skip Step 2. Go straight to Step 1, then Step 3 (rework rules apply).
- **Does not exist** → this is a **new component**. Follow all steps in order.

---

## Step 1 — Read reference files

Read these files in order before doing anything else:

1. `@soroush.tech/design-system/Typography/Typography.tsx` — canonical component implementation
2. `@soroush.tech/design-system/Typography/README.md` — canonical documentation format
3. `@soroush.tech/design-system/Typography/Typography.stories.tsx` — canonical story structure
4. `@soroush.tech/design-system/storybookOptions.ts` — existing token arrays and import patterns
5. `packages/design-system/design-system.md` — full architecture rules (authoritative source of truth)

If reworking an existing component, also read its current files:

- `packages/design-system/src/<Name>/<Name>.tsx`
- `packages/design-system/src/<Name>/README.md`
- `packages/design-system/src/<Name>/<Name>.stories.tsx`
- `packages/design-system/src/<Name>/<Name>.test.tsx`

---

## Step 2 — Clarify base element (new components only)

If the task spec already makes the base HTML element and props clear, state your interpretation and proceed without asking.

Otherwise ask:

> What is the base HTML element for `<Name>`, and what is its primary purpose?
> (e.g. `"div — a layout container"` or `"button — an interactive action trigger"`)

Use the answer to decide:

- Which HTML element to use as the base
- Which styled-system prop groups are relevant
- Which props make sense to expose

Do not generate any files until confirmed.

---

## Step 3 — Generate or update files

### New component

Create the folder `packages/design-system/src/<Name>/` with these five files:

**`index.ts`** — re-export only:

```ts
export * from './<Name>'
```

**`<Name>.tsx`**

- `styled` base with `createShouldForwardProp([...props, ...customProps])`
- Only include styled-system groups relevant to this component
- Wire `color` → `scale: 'text'` and `bg` → `scale: 'background'` via `system()` if color props are needed
- Derive all prop types from `Theme` via `keyof Theme['scaleName']` — no manual unions
- Export named prop types (e.g. `<Name>Props`)

**`README.md`**

- Document every prop: type, default, description
- Color/bg tables use palette constant names only — `kineticGreen[500]`, never hex
- Mirror the section structure of `@soroush.tech/design-system/Typography/README.md`

**`<Name>.stories.tsx`**

- Import all option arrays from `@soroush.tech/design-system/storybookOptions.ts` — never hardcode inline
- `controls.include` whitelist — no autodiscovery
- Every prop in `controls.include` must have a matching `argType` with `control`, `description`, and `table.category`
- Category names: Content · Typography · Layout · Color · Spacing
- No top-level `name:` in any argType

**`<Name>.test.tsx`**

- Cover: CSS output for each prop, HTML attribute passthrough, element mapping if a variant prop exists
- Wrap renders in `ThemeProvider`

Update `@soroush.tech/design-system/storybookOptions.ts` only if new token arrays are needed — never duplicate existing ones.

### Rework (existing component)

Apply only the changes required by the task spec. For every change made:

- **`<Name>.tsx`** — update the component
- **`<Name>.test.tsx`** — add or update tests to cover the change; remove any tests made obsolete
- **`README.md`** — update prop documentation to reflect the change; fix any stale references
- **`<Name>.stories.tsx`** — add the new prop to `controls.include` and `argTypes`; add a story if the change warrants one

Do not touch unrelated parts of any file.

---

## Step 4 — Cross-component impact

After any change, check whether other components are affected:

- If the changed component is a **base** (e.g. `View`), list every component that extends it and state what each inherits automatically vs. what needs an explicit update.
- If a **shared file** was changed (`storybookOptions.ts`, `themes.ts`, `design-system.md`), list every component that imports it.
- Present findings as a short proposal:

> **Impact on other components**
>
> - `Flex` — inherits `cursor` automatically, no changes needed
> - `Grid` — inherits `cursor` automatically, no changes needed
> - `Paper` — not yet implemented; `cursor` will be available when built

Wait for the user to confirm before making changes to other components.

---

After completing all changes, confirm what was updated and list anything still outstanding.
