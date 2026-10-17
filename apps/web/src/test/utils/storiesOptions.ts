import type { CSSObject } from '@soroush.tech/design-system/theme'
import { dark } from 'src/theme/themes'

// Storybook control options for this app's stories. Token lists come from the app's own theme
// (both brand themes share these scales), so a control offers exactly what the theme has.

const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof T>

// --- From the theme ---

export const typographyVariantTokens = objectKeys(dark.typography)
export const textColorTokens = objectKeys(dark.text)
export const spaceTokens = objectKeys(dark.space).map((k) => (k === 'auto' ? k : Number(k)))
export const fontFamilyTokens = objectKeys(dark.fonts)
export const fontSizeIndices = dark.fontSizes.map((_, i) => i)
export const fontWeightTokens = objectKeys(dark.fontWeights)
export const letterSpacingTokens = objectKeys(dark.letterSpacings)

// --- Raw values with no theme scale behind them ---

// HTML element names - an arbitrary set chosen for the `as` prop
export const asTokens = [
  'p',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'li',
] as const

export const flexJustifyContentTokens = [
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
] satisfies CSSObject['justifyContent']

export const flexAlignItemsTokens = [
  'stretch',
  'flex-start',
  'flex-end',
  'center',
  'baseline',
] satisfies CSSObject['alignItems']
