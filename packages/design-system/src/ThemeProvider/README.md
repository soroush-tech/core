# ThemeProvider

Owns dark/light mode state, provides `ThemeModeContext`, and wraps Emotion's `ThemeProvider` — all in one component.

```tsx
// src/common/Providers.tsx
<ThemeProvider>{children}</ThemeProvider>
```

---

## Exports

### `ThemeProvider`

| Prop       | Type                            | Default                           | Description                                                                      |
| ---------- | ------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `children` | `ReactNode`                     | —                                 | Required child tree                                                              |
| `themes`   | `{ dark: Theme; light: Theme }` | built-in `dark` / `light`         | Custom dark/light pair. Swapped by `toggleTheme` instead of the built-in themes. |
| `theme`    | `Theme`                         | resolved from `isDark` + `themes` | Full custom override — bypasses mode switching entirely (tests, Storybook).      |

`theme` takes precedence over `themes`. When neither is provided, the built-in `dark` and `light` themes from `@soroush.tech/design-system/themes` are used.

Internally:

1. Owns `isDark` state (defaults to `true`) and `toggleTheme`
2. Provides `ThemeModeContext` so `useThemeMode()` works anywhere in the tree
3. Resolves the active theme: `theme ?? (isDark ? themes.dark : themes.light)`
4. Mounts `GlobalStyles`

### `GlobalStyles`

Renders Emotion's `<Global>` with site-wide base styles from `@soroush.tech/design-system/globalStyles.ts`. Mounted automatically inside `ThemeProvider` — do not render separately.

### `ThemeModeContext`

The React context carrying `{ isDark, toggleTheme }`. Prefer the hook:

```ts
import { useThemeMode } from '@soroush.tech/design-system/hooks/useThemeMode'

const { isDark, toggleTheme } = useThemeMode()
```

---

## Notes

- The default starting mode is dark (`isDark` initialises to `true`).
- Passing `themes` swaps which dark/light objects are toggled between — useful for nested sub-trees that need a different palette pair.
- Passing `theme` bypasses `isDark` entirely — useful for test wrappers and Storybook decorators where a fixed theme is required.
- `ThemeModeContext` is re-exported from the barrel so `useThemeMode` can import it from `'@soroush.tech/design-system/ThemeProvider'`.
