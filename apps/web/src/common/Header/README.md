# Header

Application header built on `AppBar`. Contains the site logo linking to the homepage, primary navigation links, and a `Switch` for toggling between dark and light themes.

```tsx
// No props — the Header is self-contained.
<Header />
```

---

## Layout

Three-column `AppBar` using `flexDirection="row"` + `justifyContent="space-between"`:

| Slot   | Component             | Details                                            |
| ------ | --------------------- | -------------------------------------------------- |
| Root   | `AppBar`              | `position="fixed"`, `height="64px"`, `px={6}`      |
| Left   | `Flex` (row)          | `Logo` (40 px) + `"SOROUSH"` wordmark              |
| Center | `Flex as="nav"` (row) | `NavLink` × 4 — Home · About · Projects · Articles |
| Right  | `Flex` (row)          | `"MODE"` label + `Switch` + Sun / Moon icon        |

---

## Styling

| Property      | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| Position      | `fixed`, `top: 0`, `left: 0`, `zIndex: 50`                        |
| Height        | `64px`                                                            |
| Background    | `theme.background.primary` + `"CC"` suffix (≈ 80 % opacity)       |
| Backdrop blur | `blur(12px)` via `backdropFilter` + `-webkit-` prefix             |
| Border-bottom | `1px solid theme.border.primary` + `"33"` suffix (≈ 20 % opacity) |

The frosted-glass effect requires the page content to scroll beneath the header — do not add an opaque background or remove the `backdropFilter`.

---

## Theme toggle

The `Switch` is bound to `useThemeMode()` from `src/hooks/useThemeMode`:

- `checked={isDark}` — switch is on when dark mode is active (default)
- `onChange={toggleTheme}` — clicking the switch calls `toggleTheme`, which flips the global theme

The theme state lives in `ThemeModeProvider` (above `ThemeProvider` in the tree). Toggling re-renders `ThemeProvider` with either `dark` or `light` from `@soroush.tech/design-system/theme`.

---

## Props

`Header` accepts no props. It is a self-contained composition.

---

## Cross-component dependencies

| Import                                                                 | Used for                      |
| ---------------------------------------------------------------------- | ----------------------------- |
| `@soroush.tech/design-system/AppBar`                                   | Root element                  |
| `@soroush.tech/design-system/Switch`                                   | Theme toggle control          |
| `@soroush.tech/design-system/Flex`, `@soroush.tech/design-system/View` | Layout                        |
| `src/common/NavLink`                                                   | Active-aware navigation links |
| `src/hooks/useThemeMode`                                               | Theme state + toggle function |
