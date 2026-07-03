import { background } from '@soroush.tech/styled-system/background'
import { border } from '@soroush.tech/styled-system/border'
import { color } from '@soroush.tech/styled-system/color'
import type { Parser } from '@soroush.tech/styled-system/core'
import { flexbox } from '@soroush.tech/styled-system/flexbox'
import { grid } from '@soroush.tech/styled-system/grid'
import { layout } from '@soroush.tech/styled-system/layout'
import { position } from '@soroush.tech/styled-system/position'
import { typography } from '@soroush.tech/styled-system/typography'

export {
  get,
  createParser,
  createStyleFunction,
  compose,
  system,
  type Parser,
  type Props,
  type StyleFn,
  type StyleObject,
  type ConfigStyle,
  type SystemConfig,
  type ParserConfig,
  type Transform,
} from '@soroush.tech/styled-system/core'
// Note: the public `Theme` type is re-exported from ./types (below), not ./core.

export { margin, padding, space } from '@soroush.tech/styled-system/space'
export { color } from '@soroush.tech/styled-system/color'
export { layout } from '@soroush.tech/styled-system/layout'
export { typography } from '@soroush.tech/styled-system/typography'
export { flexbox } from '@soroush.tech/styled-system/flexbox'
export { border, border as borders } from '@soroush.tech/styled-system/border'
export { background } from '@soroush.tech/styled-system/background'
export { position } from '@soroush.tech/styled-system/position'
export { grid } from '@soroush.tech/styled-system/grid'
export {
  shadow,
  shadow as boxShadow,
  shadow as textShadow,
} from '@soroush.tech/styled-system/shadow'
export { variant, buttonStyle, textStyle, colorStyle } from '@soroush.tech/styled-system/variant'
export { style } from './style'
export * from './types'

// Single-prop functions, mirroring the upstream aggregator's destructured exports.
const layoutFns = layout as unknown as Record<string, Parser>
export const width = layoutFns.width
export const height = layoutFns.height
export const minWidth = layoutFns.minWidth
export const minHeight = layoutFns.minHeight
export const maxWidth = layoutFns.maxWidth
export const maxHeight = layoutFns.maxHeight
export const size = layoutFns.size
export const verticalAlign = layoutFns.verticalAlign
export const display = layoutFns.display
export const overflow = layoutFns.overflow
export const overflowX = layoutFns.overflowX
export const overflowY = layoutFns.overflowY

const colorFns = color as unknown as Record<string, Parser>
export const opacity = colorFns.opacity

const typographyFns = typography as unknown as Record<string, Parser>
export const fontSize = typographyFns.fontSize
export const fontFamily = typographyFns.fontFamily
export const fontWeight = typographyFns.fontWeight
export const lineHeight = typographyFns.lineHeight
export const textAlign = typographyFns.textAlign
export const fontStyle = typographyFns.fontStyle
export const letterSpacing = typographyFns.letterSpacing

const flexboxFns = flexbox as unknown as Record<string, Parser>
export const alignItems = flexboxFns.alignItems
export const alignContent = flexboxFns.alignContent
export const justifyItems = flexboxFns.justifyItems
export const justifyContent = flexboxFns.justifyContent
export const flexWrap = flexboxFns.flexWrap
export const flexDirection = flexboxFns.flexDirection
export const flex = flexboxFns.flex
export const flexGrow = flexboxFns.flexGrow
export const flexShrink = flexboxFns.flexShrink
export const flexBasis = flexboxFns.flexBasis
export const justifySelf = flexboxFns.justifySelf
export const alignSelf = flexboxFns.alignSelf
export const order = flexboxFns.order

const gridFns = grid as unknown as Record<string, Parser>
export const gridGap = gridFns.gridGap
export const gridColumnGap = gridFns.gridColumnGap
export const gridRowGap = gridFns.gridRowGap
export const gridColumn = gridFns.gridColumn
export const gridRow = gridFns.gridRow
export const gridAutoFlow = gridFns.gridAutoFlow
export const gridAutoColumns = gridFns.gridAutoColumns
export const gridAutoRows = gridFns.gridAutoRows
export const gridTemplateColumns = gridFns.gridTemplateColumns
export const gridTemplateRows = gridFns.gridTemplateRows
export const gridTemplateAreas = gridFns.gridTemplateAreas
export const gridArea = gridFns.gridArea

const borderFns = border as unknown as Record<string, Parser>
export const borderWidth = borderFns.borderWidth
export const borderStyle = borderFns.borderStyle
export const borderColor = borderFns.borderColor
export const borderTop = borderFns.borderTop
export const borderRight = borderFns.borderRight
export const borderBottom = borderFns.borderBottom
export const borderLeft = borderFns.borderLeft
export const borderRadius = borderFns.borderRadius

const backgroundFns = background as unknown as Record<string, Parser>
export const backgroundImage = backgroundFns.backgroundImage
export const backgroundSize = backgroundFns.backgroundSize
export const backgroundPosition = backgroundFns.backgroundPosition
export const backgroundRepeat = backgroundFns.backgroundRepeat

const positionFns = position as unknown as Record<string, Parser>
export const zIndex = positionFns.zIndex
export const top = positionFns.top
export const right = positionFns.right
export const bottom = positionFns.bottom
export const left = positionFns.left
