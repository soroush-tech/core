// =============================================================================
// Engine abstraction — import all styling primitives from here.
// To swap the CSS-in-JS engine, update only this section (and ./theme/emotion.ts).
// =============================================================================
export { styled, type ThemeCustomizationOptions } from './style/styled'
export { css, keyframes } from '@emotion/react'
// `ThemeProvider`, `useTheme`, and theme hooks live at the `./theme` subpath.
// `Global`, `globalStyles`, and `CacheProvider`/`styleCache` live at the `./engine`
// subpath — raw engine primitives for building your own global styles, not barrel exports.
export type { Theme, CSSObject, PaletteColor } from './theme/themes'
export * from '@soroush.tech/styled-system'
export { createShouldForwardProp, props } from '@soroush.tech/styled-system/should-forward-prop'
