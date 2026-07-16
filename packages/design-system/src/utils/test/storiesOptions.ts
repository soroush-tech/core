import type { TypographyAlign } from '../../Typography'
import type {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  ButtonShape,
  ButtonLoadingPosition,
} from '../../Button'
import type { AvatarVariant } from '../../Avatar'
import type {
  CircularProgressColor,
  CircularProgressEasing,
  CircularProgressVariant,
} from '../../CircularProgress'
import type {
  LinearProgressColor,
  LinearProgressEasing,
  LinearProgressVariant,
} from '../../LinearProgress'
import type { CheckboxColor, CheckboxSize } from '../../Checkbox'
import type { RadioColor, RadioSize } from '../../Radio'
import type { SwitchColor, SwitchEdge, SwitchSize, SwitchVariant } from '../../Switch'
import type { TextInputColor, TextInputVariant, TextInputSize } from '../../TextInput'
import type { SelectColor, SelectVariant, SelectSize } from '../../Select'
import type { SkeletonVariant, SkeletonAnimation } from '../../Skeleton'
import type { FormControlProps } from '../../FormControl'
import type { AppBarSize } from '../../AppBar'
import type { LinkUnderline } from '../../Link'
import type { CardVariant } from '../../Card'
import type { TableSize, TableCellPadding, TableCellVariant, TableCellAlign } from '../../Table'
import type { DrawerAnchor } from '../../Drawer'
import type { ModalScroll } from '../../Modal'
import {
  baseTheme,
  radii,
  sizes,
  borderWidths,
  fontSizes,
  lineHeights,
  letterSpacings,
  fonts,
  fontWeights,
  avatar,
  space,
  typography,
} from '../../themes'
import type { CSSObject } from '../../themes'

const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof T>

// --- Derived from component mappings ---

export const typographyVariantTokens = objectKeys(typography)
export const textColorTokens = objectKeys(baseTheme.text)
export const backgroundTokens = objectKeys(baseTheme.background)
export const borderColorTokens = objectKeys(baseTheme.border)

export const spaceTokens = objectKeys(space).map((k) => (k === 'auto' ? k : Number(k)))

export const fontFamilyTokens = objectKeys(fonts)
export const fontSizeIndices = fontSizes.map((_, i) => i)
export const fontWeightTokens = objectKeys(fontWeights)
export const lineHeightTokens = objectKeys(lineHeights)
export const letterSpacingTokens = objectKeys(letterSpacings)
export const borderRadiiTokens = objectKeys(radii)
export const borderWidthTokens = objectKeys(borderWidths)
export const avatarSizeTokens = objectKeys(avatar)
export const buttonColorTokens = objectKeys(baseTheme.palette) satisfies ButtonColor[]
export const buttonVariantTokens = ['contained', 'outlined', 'text'] satisfies ButtonVariant[]
export const buttonSizeTokens = objectKeys(sizes) satisfies ButtonSize[]
export const buttonShapeTokens = ['square', 'rounded', 'pill'] satisfies ButtonShape[]
export const buttonLoadingPositionTokens = [
  'start',
  'end',
  'center',
] satisfies ButtonLoadingPosition[]
export const circularProgressColorTokens = [
  ...buttonColorTokens,
  'inherit',
] satisfies CircularProgressColor[]
export const circularProgressVariantTokens = [
  'indeterminate',
  'determinate',
] satisfies CircularProgressVariant[]
export const circularProgressEasingTokens = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
] satisfies CircularProgressEasing[]
export const linearProgressColorTokens = [
  ...buttonColorTokens,
  'inherit',
] satisfies LinearProgressColor[]
export const linearProgressVariantTokens = [
  'indeterminate',
  'determinate',
  'query',
] satisfies LinearProgressVariant[]
export const linearProgressEasingTokens = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
] satisfies LinearProgressEasing[]
export const checkboxColorTokens = buttonColorTokens satisfies CheckboxColor[]
export const checkboxSizeTokens = objectKeys(sizes) satisfies CheckboxSize[]
export const radioColorTokens = buttonColorTokens satisfies RadioColor[]
export const radioSizeTokens = objectKeys(sizes) satisfies RadioSize[]
export const switchColorTokens = buttonColorTokens satisfies SwitchColor[]
export const switchSizeTokens = objectKeys(sizes) satisfies SwitchSize[]
export const switchVariantTokens = ['outside', 'inside'] satisfies SwitchVariant[]
export const switchEdgeTokens = ['start', 'end', false] satisfies SwitchEdge[]
export const textInputColorTokens = [...buttonColorTokens] satisfies TextInputColor[]
export const textInputVariantTokens = [
  'default',
  'outlined',
  'text',
  'underline',
] satisfies TextInputVariant[]
export const textInputSizeTokens = objectKeys(sizes) satisfies TextInputSize[]
export const selectColorTokens = buttonColorTokens satisfies SelectColor[]
export const selectVariantTokens = textInputVariantTokens satisfies SelectVariant[]
export const selectSizeTokens = textInputSizeTokens satisfies SelectSize[]
export const skeletonVariantTokens = ['text', 'circular', 'rectangular'] satisfies SkeletonVariant[]
export const skeletonAnimationTokens = ['pulse', 'wave', false] satisfies SkeletonAnimation[]
export const appBarSizeTokens = objectKeys(sizes) satisfies AppBarSize[]
export const formSizeTokens = objectKeys(sizes) satisfies NonNullable<FormControlProps['size']>[]
export const formColorTokens = [...buttonColorTokens] satisfies NonNullable<
  FormControlProps['color']
>[]
export const tableSizeTokens = objectKeys(sizes) satisfies TableSize[]
export const tableCellPaddingTokens = ['normal', 'none'] satisfies TableCellPadding[]
export const tableCellVariantTokens = ['head', 'body', 'footer'] satisfies TableCellVariant[]
export const tableCellAlignTokens = [
  'inherit',
  'left',
  'right',
  'center',
  'justify',
] satisfies TableCellAlign[]
export const linkUnderlineTokens = ['always', 'hover', 'none'] satisfies LinkUnderline[]
export const cardVariantTokens = ['paper', 'bracketBox', 'interactive'] satisfies CardVariant[]
export const linkTargetTokens = ['_self', '_blank', '_parent', '_top', '_unfencedTop'] as const
export const linkRelTokens = [
  'noopener noreferrer',
  'alternate',
  'author',
  'bookmark',
  'external',
  'help',
  'license',
  'me',
  'next',
  'nofollow',
  'noopener',
  'noreferrer',
  'opener',
  'prev',
  'privacy-policy',
  'search',
  'tag',
  'terms-of-service',
] as const

// --- Hardcoded: no theme/component backing ---

// TypographyAlign is a union type with no runtime object
export const alignTokens = [
  'left',
  'center',
  'right',
  'justify',
  'inherit',
] satisfies TypographyAlign[]

// HTML element names — arbitrary set chosen for the as prop
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

// AvatarVariant has no runtime mapping object in Avatar.tsx
export const avatarVariantTokens = ['circular', 'rounded', 'square'] satisfies AvatarVariant[]

// Raw CSS values — not backed by any theme scale
export const objectFitTokens = [
  'cover',
  'contain',
  'fill',
  'none',
  'scale-down',
] satisfies CSSObject['objectFit']

export const fontStyleTokens = ['normal', 'italic', 'oblique'] satisfies CSSObject['fontStyle']

export const displayTokens = [
  'block',
  'flex',
  'inline',
  'inline-flex',
  'inline-block',
  'grid',
  'none',
] satisfies CSSObject['display']

export const positionTokens = [
  'static',
  'relative',
  'absolute',
  'fixed',
  'sticky',
] satisfies CSSObject['position']

export const cursorTokens = [
  'auto',
  'default',
  'pointer',
  'move',
  'not-allowed',
  'wait',
  'text',
  'crosshair',
  'grab',
  'grabbing',
  'zoom-in',
  'zoom-out',
  'none',
] satisfies CSSObject['cursor']

export const borderStyleTokens = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'none',
] satisfies CSSObject['borderStyle']

export const flexDirectionTokens = [
  'row',
  'row-reverse',
  'column',
  'column-reverse',
] satisfies CSSObject['flexDirection']

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

export const flexWrapTokens = ['nowrap', 'wrap', 'wrap-reverse'] satisfies CSSObject['flexWrap']

export const gridAutoFlowTokens = [
  'row',
  'column',
  'dense',
  'row dense',
  'column dense',
] satisfies CSSObject['gridAutoFlow']

export const gridJustifyContentTokens = [
  'normal',
  'start',
  'end',
  'center',
  'stretch',
  'space-between',
  'space-around',
  'space-evenly',
] satisfies CSSObject['justifyContent']

export const gridAlignItemsTokens = [
  'normal',
  'start',
  'end',
  'center',
  'stretch',
  'baseline',
] satisfies CSSObject['alignItems']

export const gridAlignContentTokens = [
  'normal',
  'start',
  'end',
  'center',
  'stretch',
  'space-between',
  'space-around',
  'space-evenly',
] satisfies CSSObject['alignContent']

export const gridJustifyItemsTokens = [
  'normal',
  'start',
  'end',
  'center',
  'stretch',
] satisfies CSSObject['justifyItems']

export const anchorTokens = ['left', 'right', 'top', 'bottom'] satisfies DrawerAnchor[]
export const modalScrollTokens = ['paper', 'body'] satisfies ModalScroll[]
