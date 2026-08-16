---
name: seo
description: SEO conventions for this codebase, centered on heading hierarchy and structure. Auto-load when writing or reviewing page/section markup, adding headings, or structuring content for search visibility and screen-reader navigation.
paths: src/**/*.tsx,src/**/*.ts
argument-hint: [page or component]
---

# SEO - Heading Structure

Headings describe the page's structure, not visual emphasis. Search engines use them to filter, order, and display results; screen readers use them to navigate. Same markup serves both.

---

## One `<h1>`, at the start of main content

Exactly one `<h1>`, opening the main content. No headings before it.

```tsx
// ✗ - no h1, or h1 buried below other headings
<h2>Section</h2>
<h1>Page Title</h1>

// ✓
<h1>Page Title</h1>
<h2>Section</h2>
```

## Descend sequentially - never skip a level

The level after `<h1>` is `<h2>`, then `<h3>`, and so on. Don't jump `h2 → h4`.

```tsx
// ✗ - skips h2
<h1>Setting Exposure Manually</h1>
<h3>Set the ISO</h3>

// ✓
<h1>Setting Exposure Manually</h1>
<h2>Set the ISO</h2>
<h2>Choose an Aperture</h2>
```

## Heading markup only for headings

Use `<h1>`-`<h6>` _if and only if_ the text is a heading. Never apply heading tags to make text large or bold.

```tsx
// ✗ - heading tag used for visual weight on non-heading text
<h3>Sale ends Friday!</h3>

// ✓ - style a real element instead
<Typography variant="bold">Sale ends Friday!</Typography>
```

## Headings are brief, clear, unique

Skim only the headings: do they convey the page's contents? If not, rewrite them. Outline the page first (title → sections → subsections), then map that outline onto `h1`-`h6`.

---

If seo names a file, read it and apply the rules. Otherwise apply to the code being discussed.
