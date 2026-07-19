# ThemeProvider

Provides exactly **one** theme to the tree — a thin wrapper over Emotion's provider plus the optional `defaults` merge. It has no opinion about how many themes you have or how you switch between them: mode toggling is app state, not the provider's (see [`docs/theming.md`](../../docs/theming.md)).

```tsx
import { ThemeProvider } from '@soroush.tech/design-system/theme'

// Zero-config: the built-in dark theme.
<ThemeProvider>{app}</ThemeProvider>

// Your theme — written from scratch or extended from a built-in via createTheme.
<ThemeProvider theme={brandDark}>{app}</ThemeProvider>
```

---

## Props

| Prop       | Type            | Default         | Description                                                                               |
| ---------- | --------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `children` | `ReactNode`     | —               | Required child tree                                                                       |
| `theme`    | `Theme`         | built-in `dark` | The active theme. Bring one, or many managed by your own state.                           |
| `defaults` | `ThemeDefaults` | —               | Component default token/variant keys, merged into the theme (e.g. `{ size: 'compact' }`). |

When `defaults` is provided, the provider merges it into the theme via `createTheme(theme, { defaults })` (memoized). Otherwise the theme passes through untouched.

## Mode switching

Owned by the consumer — hold the state and pass the active theme:

```tsx
const [isDark, setIsDark] = useState(true)
<ThemeProvider theme={isDark ? dark : light}>{app}</ThemeProvider>
```

The web app's reference implementation is `apps/web/src/theme/ThemeModeProvider.tsx` (context + `useThemeMode()` + the brand theme pair).

## Related

- `createTheme(base, overrides)` — deep-merge primitive for building themes ([`docs/theming.md`](../../docs/theming.md)).
- `theme.components` — per-component customization the provider carries along ([`docs/customization.md`](../../docs/customization.md)).
