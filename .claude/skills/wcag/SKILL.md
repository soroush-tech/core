---
name: wcag
description: WCAG accessibility rules for this codebase. Auto-load when fixing a11y violations, reviewing color contrast, adding ARIA attributes, auditing interactive components (progressbar, button, checkbox, switch, nav), or writing a11y tests/stories.
paths: src/**/*.tsx,src/**/*.ts
argument-hint: [component or violation]
---

# WCAG Accessibility Patterns

WCAG 2.2 AA is the target. Four principles: **Perceivable · Operable · Understandable · Robust** (POUR). Automated tools catch ~30% of issues - always verify manually with keyboard navigation and screen reader.

---

## Perceivable

### Text contrast ratios (SC 1.4.3 / 1.4.11)

- Normal text (< 18pt / < 14pt bold): **4.5:1 minimum**
- Large text (≥ 18pt / ≥ 14pt bold): **3:1 minimum**
- UI components and focus indicators: **3:1 minimum**
- **Disabled UI components are exempt** - but only when actually disabled, not when reusing the disabled color token on regular text

### `opacity` compounds with the background - compute the effective color

```
effective = alpha × foreground + (1 - alpha) × background
```

```tsx
// ✗ - opacity: 0.5 on secondary (#444748) over #e2e2e2 → effective #939595 → 2.32:1
<Typography color="secondary" opacity={0.5}>© 2026 ...</Typography>

// ✓ - solid secondary (#444748) → 7.22:1
<Typography color="secondary">© 2026 ...</Typography>
```

When fixing hex-alpha tokens (e.g. `#1a1c1c4D`): compute the effective color on every background it appears on, then raise the alpha until the weakest background clears 4.5:1.

### `visibility: hidden` removes content from the accessibility tree

`visibility: hidden` strips an element from the AT; `opacity: 0` keeps it.

```tsx
// ✗ - button has no accessible name while loading (label hidden from AT)
...(invisible && { visibility: 'hidden' })

// ✓ - text stays in AT; spinner overlays via position: absolute
...(invisible && { opacity: 0 })
```

Also add `aria-busy` to the interactive root when it is loading:

```tsx
<ButtonRoot aria-busy={loading || undefined} {...rest} />
```

---

## Operable

### Keyboard: never remove focus indicators

```tsx
// ✗ - removes all focus styling
button:focus { outline: none; }

// ✓ - visible on keyboard focus only
button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
```

Tab order must follow DOM order. Every interactive element must be reachable and operable by keyboard alone.

---

## Understandable

### Labels for all form inputs

Every `<input>` needs an accessible name via one of:

1. **Wrapping `<label>`** - preferred when label text is visible
2. **`aria-label`** - for icon-only or visually unlabeled controls
3. **`aria-labelledby`** - when the label text exists elsewhere in the DOM

`Checkbox` and `Switch` wrap a hidden `<input>` inside a `<label>`. When no `children` are passed, all icons have `aria-hidden="true"`, leaving the input with no accessible name:

```tsx
// ✗ - input has no accessible name
<Checkbox color="primary" />
<Switch color="primary" />

// ✓ - aria-label forwarded to the hidden <input>
<Checkbox color="primary" aria-label="Accept terms" />
<Switch color="primary" aria-label="Enable notifications" />

// ✓ - children become the label text (preferred when text is visible)
<Checkbox color="primary">Accept terms</Checkbox>
```

Apply at every usage site: pages, stories, and tests.

---

## Robust

### ARIA: semantic-first, ARIA second

Use native HTML elements before reaching for ARIA. ARIA never fixes broken semantics - it annotates correct structure.

```tsx
// ✗ - div with click handler, no keyboard, no role
<div onClick={open}>Menu</div>

// ✓ - native button, keyboard-ready
<button onClick={open}>Menu</button>
```

### Interactive ARIA roles require accessible names (SC 4.1.2)

Every element with an ARIA landmark or widget role needs a label. Common violations:

**`role="progressbar"`** - add a default `aria-label` overridable by spread:

```tsx
// ✗
<span role="progressbar">...</span>

// ✓
<CircularProgressRoot role="progressbar" aria-label="Loading" {...rest} />
```

**Multiple `<nav>` landmarks** - when a page has more than one `<nav>`, each must have a unique label so screen reader users can distinguish them:

```tsx
// ✗ - two unlabeled <nav> elements on the same page
<Navbar items={NAV_ITEMS} />
<Navbar items={FOOTER_ITEMS} />

// ✓ - unique aria-label on every <nav>
<Navbar aria-label="Main" items={NAV_ITEMS} />
<Navbar aria-label="Directories" items={FOOTER_ITEMS} />
```

**Links within a nav** - set `aria-label` on each link equal to its visible text so the accessible name is explicit even when text rendering is suppressed:

```tsx
// ✓ - aria-label matches visible children
<NavLink href={href} aria-label={label}>
  {label}
</NavLink>
```

### `display: none` / `visibility: hidden` hide from AT - use them intentionally

| CSS                  | In layout | In AT |
| -------------------- | --------- | ----- |
| `display: none`      | ✗         | ✗     |
| `visibility: hidden` | ✓         | ✗     |
| `opacity: 0`         | ✓         | ✓     |
| `clip` / sr-only     | ✗         | ✓     |

Use `aria-hidden="true"` on decorative SVG icons so they don't pollute the AT with meaningless text.

---

## Testing

A11y is validated automatically by `@storybook/addon-a11y`, which runs axe on
**every story** during `test:storybook`. Enforcement lives in
`.storybook/preview.tsx` → `parameters.a11y.test`: `'error'` fails CI, `'todo'`
reports only, `'off'` skips. There are **no standalone a11y test files** -
coverage comes from the breadth of stories.

**Writing the test = writing stories:**

- **One story per meaningful state** (default, disabled, error, each
  variant/color). axe only checks what renders, so more states = more coverage.
- **Give controls an accessible name in the story** - icon-only / unlabeled
  controls fail axe under `'error'`:

  ```tsx
  export const Default: Story = { args: { color: 'primary', 'aria-label': 'Search' } }
  ```

- **Stateful violations (focus, expanded, post-submit error) → `play`**; axe
  runs after `play`:

  ```tsx
  import { userEvent, within } from 'storybook/test'

  export const Invalid: Story = {
    args: { 'aria-label': 'Email', type: 'email' },
    play: async ({ canvasElement }) => {
      const input = within(canvasElement).getByRole('textbox', { name: 'Email' })
      await userEvent.type(input, 'bad@')
      await userEvent.tab()
    },
  }
  ```

- **Quarantine / tune per story** - only with a documented reason:

  ```tsx
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: false }]
      }
    }
  }
  // or test: 'todo' to exclude a known-failing story from CI
  ```

In component unit tests (`*.test.tsx`), query with `getByRole(role, { name })`
over `data-testid` - it asserts the accessible role + name exist, testing a11y
implicitly.

axe catches ~30%. Keyboard order, `:focus-visible`, and effective contrast
under `opacity` still need manual verification.

---

## Anti-patterns

- Relying solely on automated tools - they miss ~70% of issues
- Using ARIA to patch non-semantic HTML instead of fixing the HTML
- Removing focus indicators for aesthetics
- Hiding content with `display: none` and expecting AT to read it
- Using `opacity` on text without checking the effective contrast against the actual background
- Icon-only controls (checkbox, switch, button) without `aria-label`
- Multiple `<nav>` / `<main>` / `<header>` landmarks without unique labels
- Treating accessibility as a post-launch addition

If wcag names a file, read it and apply the rules. Otherwise apply to the code being discussed.
