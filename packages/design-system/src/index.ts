// =============================================================================
// Engine abstraction — import all styling primitives from here.
// To swap the CSS-in-JS engine, update only this section (and ./engine.ts).
// =============================================================================
export { styled, type ThemeCustomizationOptions } from './styled'
export { css, keyframes } from '@emotion/react'
export { useTheme } from './hooks/useTheme'
// `Global` is retyped against this package's `Theme`; `CacheProvider` pairs with
// `./utils/styleCache` for SSR critical-CSS extraction (e.g. `@emotion/server`) —
// a legitimate integration point, not a Theme concern.
export { Global, CacheProvider } from './engine'
export type { Theme, CSSObject, PaletteColor } from './themes'
export * from '@soroush.tech/styled-system'
export { createShouldForwardProp, props } from '@soroush.tech/styled-system/should-forward-prop'
