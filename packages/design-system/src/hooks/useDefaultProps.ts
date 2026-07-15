import type { ThemeComponents } from '@emotion/react'
import { useTheme } from './useTheme'

type DefaultPropsOf<N extends keyof ThemeComponents> = NonNullable<
  NonNullable<ThemeComponents[N]>['defaultProps']
>

/**
 * The theme-contributed default prop values for a component
 * (`theme.components[name].defaultProps`), or an empty object.
 *
 * Components apply it as one step of the default-resolution chain:
 * explicit prop → group context → `useDefaultProps` → `theme.defaults.*` → literal fallback.
 */
export function useDefaultProps<N extends keyof ThemeComponents>(name: N): DefaultPropsOf<N> {
  const theme = useTheme()
  return (theme.components?.[name]?.defaultProps ?? {}) as DefaultPropsOf<N>
}
