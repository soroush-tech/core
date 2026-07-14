import { type SVGProps } from 'react'
import {
  styled,
  createShouldForwardProp,
  props,
  layout,
  space,
  system,
  type LayoutProps,
  type SpaceProps,
} from '../index'
import { type TextColorToken } from '../Typography'
import { icons, type IconName } from './icons'

export interface IconProps
  extends
    Omit<SVGProps<SVGSVGElement>, 'color' | 'ref' | 'width' | 'height' | 'display' | 'overflow'>,
    LayoutProps,
    SpaceProps {
  /** Registry key of the icon to render. */
  name: IconName
  /** Resolves against theme.text — applied as `color`, which the SVG inherits via `currentColor`. */
  color?: TextColorToken
  /** Sets both width and height (icons are square). */
  size?: string | number
}

const shouldForwardProp = createShouldForwardProp([...props])

// color → theme.text; the styled svg's `fill: currentColor` then resolves to it,
// overriding the asset's baked fill attribute (CSS beats presentation attributes).
const colorSystem = system({
  color: { property: 'color', scale: 'text' },
})

const StyledIcon = styled('svg', { label: 'icon', shouldForwardProp })(
  { fill: 'currentColor' },
  layout,
  space,
  colorSystem
)

export function Icon({ name, color = 'primary', size = '1.5rem', ...rest }: Readonly<IconProps>) {
  return (
    <StyledIcon as={icons[name]} color={color} width={size} height={size} aria-hidden {...rest} />
  )
}
