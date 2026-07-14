// =============================================================================
// Engine abstraction — import all styling primitives from here.
// To swap the CSS-in-JS engine, update only this section.
// =============================================================================
export { default as styled } from '@emotion/styled'
export {
  css,
  Global,
  keyframes,
  useTheme,
  CacheProvider,
  ThemeProvider as EmotionThemeProvider,
} from '@emotion/react'
export { ThemeContext as EmotionThemeContext } from '@emotion/react'
export type { Theme, CSSObject } from '@emotion/react'
export type { PaletteColor } from './themes'
export * from '@soroush.tech/styled-system'
export { createShouldForwardProp, props } from '@soroush.tech/styled-system/should-forward-prop'
