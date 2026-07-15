import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  borderWidth,
  borderStyle,
  borderColor,
  flexbox,
  layout,
  position,
  space,
  system,
} from '../index'
import { Flex, type FlexProps } from '../Flex'
import { themeDefault } from '../utils/themeDefault'

/** Valid values for the color prop — derived from theme.background keys. */
export type AppBarColor = keyof Theme['background']

export type AppBarPosition = 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky'

/** Padding preset from theme.sizes. Default: 'md', overridable via `theme.defaults.size`. */
export type AppBarSize = keyof Theme['sizes']

export interface AppBarProps extends Omit<FlexProps, 'position' | 'bg'> {
  /** Resolves against theme.background — sets the AppBar background color. */
  color?: AppBarColor
  /** CSS position value for layout placement. Default: browser default (static). */
  position?: AppBarPosition
  /** Box-shadow elevation (index into theme.shadows, 0–24). Default: `4`; use `0` for no shadow. */
  elevation?: number
  /** Padding preset from theme.sizes. Default: 'md', overridable via `theme.defaults.size`. */
  size?: AppBarSize
  /** Applies backdrop-filter: blur(theme.blur) + webkit prefix for frosted-glass effect. */
  blur?: boolean
}

type AppBarBaseProps = Omit<AppBarProps, 'size' | 'elevation'> & {
  size?: AppBarSize
  elevation: number
}

const shouldForwardProp = createShouldForwardProp([...props, 'elevation', 'size', 'blur'])

// color → theme.background (background color of the bar)
const colorSystem = system({
  color: { property: 'backgroundColor', scale: 'background' },
})

// elevation → theme.shadows[value] via system(). One prop, one CSS property, one theme scale.
const elevationVariant = system({
  elevation: { property: 'boxShadow', scale: 'shadows' },
})

const blurSystem = ({ blur, theme }: AppBarBaseProps & { theme: Theme }) =>
  blur
    ? { backdropFilter: `blur(${theme.blur})`, WebkitBackdropFilter: `blur(${theme.blur})` }
    : undefined

// Default stacking order so the bar layers above page content. Applied before the
// `position` group below, so an explicit `zIndex` prop still wins.
const zOrderDefault = ({ theme }: AppBarBaseProps & { theme: Theme }) => ({
  zIndex: theme.zOrder.appBar,
})

const sizeVariants = ({ theme, size }: AppBarBaseProps & { theme: Theme }) => {
  const s = theme.sizes[size ?? themeDefault(theme, 'size', 'md')]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
  }
}

const AppBarBase = styled(Flex, {
  name: 'AppBar',
  label: 'AppBar',
  shouldForwardProp,
  systemProps: [
    colorSystem,
    blurSystem,
    border,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    borderWidth,
    borderStyle,
    borderColor,
    flexbox,
    space,
    layout,
    zOrderDefault,
    position,
  ],
})<AppBarBaseProps>({ flexShrink: 0, width: '100%' }, elevationVariant, sizeVariants)

export function AppBar({ elevation = 4, size, ...rest }: Readonly<AppBarProps>) {
  return <AppBarBase as="header" elevation={elevation} size={size} {...rest} />
}
