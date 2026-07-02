// Typed rewrite of @styled-system/prop-types (styled-system v5).
// Builds React `propTypes` maps from each parser's `propNames`, so a component can
// spread the props a styled-system function accepts:
//   Box.propTypes = { ...propTypes.space, ...propTypes.color }
import PropTypes from 'prop-types'
import { background } from '@soroush.tech/styled-system/background'
import { border } from '@soroush.tech/styled-system/border'
import { color } from '@soroush.tech/styled-system/color'
import { flexbox } from '@soroush.tech/styled-system/flexbox'
import { grid } from '@soroush.tech/styled-system/grid'
import { layout } from '@soroush.tech/styled-system/layout'
import { position } from '@soroush.tech/styled-system/position'
import { shadow } from '@soroush.tech/styled-system/shadow'
import { space } from '@soroush.tech/styled-system/space'
import { typography } from '@soroush.tech/styled-system/typography'
import { buttonStyle, colorStyle, textStyle } from '@soroush.tech/styled-system/variant'

// A React prop-types validator. Declared structurally so our public `.d.ts` does not
// leak `@types/prop-types` onto consumers.
export type PropTypeValidator = (
  props: Record<string, unknown>,
  propName: string,
  componentName: string,
  location: string,
  propFullName: string
) => Error | null

export type PropTypeMap = Record<string, PropTypeValidator>

// Every style prop is a number, string, responsive array, or responsive object.
export const propType = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.string,
  PropTypes.array,
  PropTypes.object,
]) as unknown as PropTypeValidator

export const createPropTypes = (props: string[]): PropTypeMap =>
  props.reduce<PropTypeMap>((acc, name) => {
    acc[name] = propType
    return acc
  }, {})

const propTypes = {
  space: createPropTypes(space.propNames),
  color: createPropTypes(color.propNames),
  layout: createPropTypes(layout.propNames),
  typography: createPropTypes(typography.propNames),
  flexbox: createPropTypes(flexbox.propNames),
  border: createPropTypes(border.propNames),
  background: createPropTypes(background.propNames),
  position: createPropTypes(position.propNames),
  grid: createPropTypes(grid.propNames),
  shadow: createPropTypes(shadow.propNames),
  buttonStyle: createPropTypes(buttonStyle.propNames),
  textStyle: createPropTypes(textStyle.propNames),
  colorStyle: createPropTypes(colorStyle.propNames),
}

export default propTypes
