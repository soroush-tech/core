// Type-level test: consumer-style theme augmentation against the PUBLISHED d.ts.
// Runs via `pnpm test:types` (builds dist first, then typechecks this isolated
// program). Guards two things: the `declare module '@soroush.tech/design-system/theme'`
// block survives tsdown's d.ts chunking, and consumer augmentations widen the
// scale unions that component props derive from.
import type {
  ComponentConfig,
  Theme,
  PaletteEntry,
  SizeEntry,
  ThemeOverride,
} from '@soroush.tech/design-system/theme'
import { baseTheme, createTheme } from '@soroush.tech/design-system/theme'
import type { ButtonColor, ButtonVariant } from '@soroush.tech/design-system/Button'
import type { CheckboxSize } from '@soroush.tech/design-system/Checkbox'
import type { ViewBackgroundToken } from '@soroush.tech/design-system/View'

declare module '@soroush.tech/design-system/theme' {
  interface ThemePalette {
    brand: PaletteEntry
  }
  interface ThemeBackground {
    tertiary: string
  }
  interface ThemeSizes {
    xl: SizeEntry
  }
  interface Theme {
    elevations: Record<'low' | 'mid' | 'high', string>
  }
  // New Button variant value + a consumer component registered for theme customization.
  interface ButtonVariants {
    dashed: true
  }
  interface ThemeComponents {
    MyWidget?: ComponentConfig<{ mood?: 'calm' | 'loud' }, 'root' | 'handle'>
  }
}

// Component prop unions widen to the augmented keys…
export const brandColor: ButtonColor = 'brand'
export const xlSize: CheckboxSize = 'xl'
export const tertiaryBg: ViewBackgroundToken = 'tertiary'
export const elevationKey: keyof Theme['elevations'] = 'mid'

// …while unknown keys still error.
// @ts-expect-error -- 'bogus' is not a palette color
export const bogusColor: ButtonColor = 'bogus'
// @ts-expect-error -- 'xxl' is not a theme size
export const bogusSize: CheckboxSize = 'xxl'

// Registered Button variant values widen the union; unknown values still error.
export const dashedVariant: ButtonVariant = 'dashed'
// @ts-expect-error -- 'wiggly' was never registered in ButtonVariants
export const bogusVariant: ButtonVariant = 'wiggly'

// Sparse overrides accept augmented keys, and createTheme yields the augmented Theme.
export const override: ThemeOverride = {
  palette: { brand: { main: '#00ff88', light: '#66ffb2', dark: '#00b25f', contrastText: '#000' } },
  background: { tertiary: '#101418' },
  elevations: { low: '0 1px 2px', mid: '0 2px 6px', high: '0 6px 18px' },
  // theme.defaults accepts augmented keys — components then default to them.
  defaults: { size: 'xl', color: 'brand', bg: 'tertiary' },
  // Per-component customization: built-in and consumer-registered components.
  components: {
    Button: {
      defaultProps: { size: 'xl', variant: 'dashed' },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: theme.radii.lg,
          opacity: ownerState.disabled ? 0.4 : 1,
        }),
      },
      variants: [{ props: { variant: 'dashed' }, style: { borderStyle: 'dashed' } }],
    },
    MyWidget: {
      defaultProps: { mood: 'calm' },
      styleOverrides: { handle: { cursor: 'grab' } },
    },
  },
}
export const augmentedTheme: Theme = createTheme(baseTheme, override)
