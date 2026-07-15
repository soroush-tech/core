import { useMemo, type ElementType, type HTMLAttributes } from 'react'
import type { ButtonVariant, ButtonColor, ButtonSize } from '../Button'
import { alpha } from '../utils'
import { ButtonGroupContext } from './ButtonGroupContext'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  get,
  type SpaceProps,
} from '../index'
import { themeDefault } from '../utils/themeDefault'

export type ButtonGroupOrientation = 'horizontal' | 'vertical'

export type ButtonGroupRadius = keyof Theme['radii']

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, SpaceProps<Theme> {
  /** Visual style for all child buttons. Default: `'outlined'`. */
  variant?: ButtonVariant
  /** Color palette for all child buttons — resolves against `theme.palette`. Default: 'primary', overridable via `theme.defaults.color`. */
  color?: ButtonColor
  /** Density for all child buttons — resolves against `theme.sizes`. Default: 'md', overridable via `theme.defaults.size`. */
  size?: ButtonSize
  /** Layout flow direction. Default: `'horizontal'`. */
  orientation?: ButtonGroupOrientation
  /** Group corner radius — rounds the group's outer corners only. Resolves against `theme.radii`. Default: 'md', overridable via `theme.defaults.borderRadius`. */
  borderRadius?: ButtonGroupRadius
  /** Disables all child buttons. Default: `false`. */
  disabled?: boolean
  /** Group fills its container; children share the width. Default: `false`. */
  fullWidth?: boolean
  as?: ElementType
}

const shouldForwardProp = createShouldForwardProp([...props, 'orientation', 'fullWidth', 'variant'])

interface GroupRootProps {
  orientation?: ButtonGroupOrientation
  borderRadius?: ButtonGroupRadius
  variant?: ButtonVariant
  color?: ButtonColor
  fullWidth?: boolean
}

// Adjacent buttons merge: doubled borders collapse via a negative margin, and the
// group's `borderRadius` rounds only its outer corners — the first/last buttons keep
// their leading/trailing corners, every inner corner is squared. `:only-child` comes
// last so a lone button keeps the full radius on all four corners.
const orientationStyles = ({
  theme,
  orientation = 'horizontal',
  borderRadius,
}: GroupRootProps & { theme: Theme }) => {
  const overlap = `-${theme.borderWidths.thin}`
  const r = get(theme, `radii.${borderRadius ?? themeDefault(theme, 'borderRadius', 'md')}`)
  if (orientation === 'vertical') {
    return {
      flexDirection: 'column' as const,
      '& > *:first-of-type': {
        borderTopLeftRadius: r,
        borderTopRightRadius: r,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },
      '& > *:last-of-type': {
        borderBottomLeftRadius: r,
        borderBottomRightRadius: r,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      },
      '& > *:not(:first-of-type):not(:last-of-type)': { borderRadius: 0 },
      '& > *:only-child': { borderRadius: r },
      '& > *:not(:first-of-type)': { marginTop: overlap },
    }
  }
  return {
    flexDirection: 'row' as const,
    '& > *:first-of-type': {
      borderTopLeftRadius: r,
      borderBottomLeftRadius: r,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& > *:last-of-type': {
      borderTopRightRadius: r,
      borderBottomRightRadius: r,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    '& > *:not(:first-of-type):not(:last-of-type)': { borderRadius: 0 },
    '& > *:only-child': { borderRadius: r },
    '& > *:not(:first-of-type)': { marginLeft: overlap },
  }
}

// Each seam is painted on the leading edge of the trailing button (left edge when
// horizontal, top edge when vertical) so exactly one border shows there:
// - `outlined` buttons already carry a main-colored border, so the trailing edge is
//   made `transparent` — otherwise the `-thin` overlap would stack two borders and
//   render a doubled/misaligned line. The width is kept, so nothing shifts.
// - `contained` / `text` buttons have transparent side borders, so a visible divider
//   is drawn instead (the color's `dark` shade, or a translucent `main`).
const dividerStyles = ({
  theme,
  orientation = 'horizontal',
  variant = 'outlined',
  color: colorProp,
}: GroupRootProps & { theme: Theme }) => {
  const color = colorProp ?? themeDefault(theme, 'color', 'primary')
  const edge = orientation === 'vertical' ? 'borderTopColor' : 'borderLeftColor'
  if (variant === 'outlined') {
    return { '& > *:not(:first-of-type)': { [edge]: 'transparent' } }
  }
  const dividerColor =
    variant === 'contained'
      ? get(theme, `palette.${color}.dark`)
      : alpha(get(theme, `palette.${color}.main`), 0.5)
  return { '& > *:not(:first-of-type)': { [edge]: dividerColor } }
}

const fullWidthStyles = ({ fullWidth }: GroupRootProps) =>
  fullWidth ? { display: 'flex', width: '100%', '& > *': { flex: 1 } } : {}

const GroupRoot = styled('div', {
  name: 'ButtonGroup',
  label: 'ButtonGroup',
  shouldForwardProp,
  systemProps: [space],
})<GroupRootProps & SpaceProps<Theme>>(
  { display: 'inline-flex' },
  orientationStyles,
  dividerStyles,
  fullWidthStyles
)

/**
 * Groups related `Button` immediate children into a visually joined cluster and
 * broadcasts `variant` / `color` / `size` / `disabled` / `fullWidth` to them via
 * `ButtonGroupContext` (explicit props on a child win).
 */
export function ButtonGroup({
  variant = 'outlined',
  // color/size stay undefined here so children fall back to theme.defaults themselves.
  color,
  size,
  orientation = 'horizontal',
  borderRadius,
  disabled = false,
  fullWidth = false,
  as,
  children,
  ...rest
}: Readonly<ButtonGroupProps>) {
  const context = useMemo(
    () => ({ variant, color, size, disabled, fullWidth }),
    [variant, color, size, disabled, fullWidth]
  )

  return (
    <ButtonGroupContext.Provider value={context}>
      <GroupRoot
        as={as}
        role="group"
        orientation={orientation}
        borderRadius={borderRadius}
        variant={variant}
        color={color}
        fullWidth={fullWidth}
        {...rest}
      >
        {children}
      </GroupRoot>
    </ButtonGroupContext.Provider>
  )
}
