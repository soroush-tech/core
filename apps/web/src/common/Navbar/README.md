# Navbar

Navigation landmark (`<nav>`) wrapping `NavLink` items from a static config array. Direction-agnostic - pass `direction="horizontal"` for the header nav, `direction="vertical"` for footer nav. Active-link highlighting is fully delegated to `NavLink`; `Navbar` never sets `color`.

```tsx
<Navbar
  items={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ]}
  direction="horizontal"
  gap={4}
  variant="button"
  letterSpacing="tight"
/>
```

---

## Props

| Prop            | Type                            | Default        | Description                                      |
| --------------- | ------------------------------- | -------------- | ------------------------------------------------ |
| `items`         | `NavItem[]`                     | -              | Required. Array of `{ href, label }` nav entries |
| `direction`     | `'horizontal' \| 'vertical'`    | `'horizontal'` | Flex direction of the nav container              |
| `gap`           | `number`                        | -              | Gap between items - resolves from `theme.space`  |
| `variant`       | `TypographyVariant`             | -              | Typographic scale forwarded to each `NavLink`    |
| `letterSpacing` | `keyof Theme['letterSpacings']` | -              | Letter spacing forwarded to each `NavLink`       |
| `underline`     | `LinkUnderline`                 | `'hover'`      | Underline behavior forwarded to each `NavLink`   |

### NavItem shape

```ts
type NavItem = { href: string; label: string }
```

Adding a nav item is a one-line change to the items array passed to `Navbar`.

---

## Active-link behavior

Color is **not** set by `Navbar`. Each `NavLink` determines its own active state by comparing the current `urlPathname` (from `usePageContext`) against its `href`:

- Exact match (`href === '/'`) - active only when `urlPathname === '/'`
- Prefix match (all other hrefs) - active when `urlPathname.startsWith(href)`

Active → `color="primary"` · Inactive → `color="secondary"`

---

## Usage

### Header (horizontal)

```tsx
const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/articles', label: 'Articles' },
]

<Navbar
  items={NAV_ITEMS}
  direction="horizontal"
  gap={4}
  variant="button"
  letterSpacing="tight"
/>
```

### Footer (vertical)

```tsx
<Navbar items={DIRECTORIES} direction="vertical" gap={2} variant="caption" underline="none" />
```
