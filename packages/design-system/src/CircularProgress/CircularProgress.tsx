import { type HTMLAttributes } from 'react'
import {
  styled,
  type Theme,
  keyframes,
  createShouldForwardProp,
  props,
  space,
  layout,
  type SpaceProps,
  type LayoutProps,
  type PaddingProps,
} from '../index'
import type { ButtonColor } from '../Button'
import { clamp } from '../utils'
import { themeDefault } from '../utils/themeDefault'

export type CircularProgressVariant = 'indeterminate' | 'determinate'
export type CircularProgressColor = ButtonColor | 'inherit'
export type CircularProgressEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

// HTMLAttributes<HTMLSpanElement> avoids the SVG height/display type conflicts
// that arise when LayoutProps is combined with SVGAttributes.
export interface CircularProgressProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    Omit<SpaceProps<Theme>, keyof PaddingProps>,
    LayoutProps<Theme> {
  /** Visual variant — looping animation or value-driven arc. Default: `'indeterminate'`. */
  variant?: CircularProgressVariant
  /** Stroke color — resolves to `theme.palette[color].main`; `'inherit'` uses `currentColor`. Default: 'primary', overridable via `theme.defaults.color`. */
  color?: CircularProgressColor
  /** Width and height. Number → px; string → raw CSS unit (e.g. `'3rem'`). Default: `40`. */
  size?: number | string
  /** SVG stroke width in viewBox user units. Default: `3.6`. */
  thickness?: number
  /** Progress value for the `'determinate'` variant. Clamped between `min` and `max`. */
  value?: number
  /** Minimum value for `'determinate'`. Default: `0`. */
  min?: number
  /** Maximum value for `'determinate'`. Default: `100`. */
  max?: number
  /** Disables the stroke shrink/expand animation (`'indeterminate'` only). */
  disableShrink?: boolean
  /** Applies the rotation animation to a `'determinate'` arc — arc length reflects `value` while the spinner still rotates. */
  spinning?: boolean
  /** Timing function for the rotation animation. Default: `'linear'`. */
  easing?: CircularProgressEasing
  /** Renders a faint full-ring track behind the progress arc. Default: `false`. */
  showTrack?: boolean
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'color',
  'size',
  'thickness',
  'variant',
  'disableShrink',
  'value',
  'min',
  'max',
  'spinning',
  'easing',
  'showTrack',
])

const VIEWBOX = 44
const SIZE_DEFAULT = 40
const THICKNESS_DEFAULT = 3.6

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const dash = keyframes({
  '0%': { strokeDasharray: '1px, 200px', strokeDashoffset: '0px' },
  '50%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-15px' },
  '100%': { strokeDasharray: '100px, 200px', strokeDashoffset: '-125px' },
})

// ─── Internal sub-components ──────────────────────────────────────────────────

const CircularProgressTrack = styled('circle', {
  name: 'CircularProgress',
  slot: 'track',
  label: 'CircularProgressTrack',
})({
  fill: 'none',
  stroke: 'currentColor',
  opacity: 0.2,
})

const CircularProgressCircle = styled('circle', {
  name: 'CircularProgress',
  slot: 'circle',
  label: 'CircularProgressCircle',
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'disableShrink',
})<Pick<CircularProgressProps, 'variant' | 'disableShrink'>>(({ variant, disableShrink }) => ({
  fill: 'none',
  stroke: 'currentColor',
  ...(variant === 'indeterminate'
    ? {
        strokeDasharray: '80px, 200px',
        strokeDashoffset: '0px',
        ...(!disableShrink && { animation: `${dash} 1.4s ease-in-out infinite` }),
      }
    : {}),
}))

// ─── Styling functions ────────────────────────────────────────────────────────

const colorStyle = ({ color: colorProp, theme }: CircularProgressProps & { theme: Theme }) => {
  const color = colorProp ?? themeDefault(theme, 'color', 'primary')
  if (color === 'inherit') return {}
  return { color: theme.palette[color].main }
}

const sizeStyle = ({ size = SIZE_DEFAULT }: CircularProgressProps) => ({
  display: 'inline-flex',
  width: size,
  height: size,
  flexShrink: 0,
  verticalAlign: 'middle',
})

// Rotation applies for indeterminate, or for determinate when spinning=true.
const rotationStyle = ({
  variant = 'indeterminate',
  spinning,
  easing = 'linear',
}: CircularProgressProps) =>
  variant === 'indeterminate' || spinning ? { animation: `${rotate} 1.4s ${easing} infinite` } : {}

const safeLayout = (props: CircularProgressProps & { theme?: Theme }) =>
  layout({ ...props, size: undefined })

// ─── Styled root ──────────────────────────────────────────────────────────────

// Root is a <span> to avoid SVG attribute type conflicts with styled-system's
// LayoutProps (SVGAttributes.height is string|number; LayoutProps.height can be null).
// The <svg> inside is a plain element that fills the span via width/height="100%".
const CircularProgressRoot = styled('span', {
  name: 'CircularProgress',
  label: 'CircularProgress',
  shouldForwardProp,
  systemProps: [space, safeLayout],
})<CircularProgressProps>(colorStyle, sizeStyle, rotationStyle)

// ─── Public component ─────────────────────────────────────────────────────────

export function CircularProgress({
  variant = 'indeterminate',
  // undefined resolves to themeDefault(theme, 'color', 'primary') in the styled layer.
  color,
  size = SIZE_DEFAULT,
  thickness = THICKNESS_DEFAULT,
  value,
  min = 0,
  max = 100,
  disableShrink = false,
  spinning = false,
  easing = 'linear',
  showTrack = false,
  ...rest
}: Readonly<CircularProgressProps>) {
  const r = (VIEWBOX - thickness * 2) / 2
  const circumference = 2 * Math.PI * r
  const normalizedValue = clamp(value ?? min, min, max)

  const circleStyle =
    variant === 'determinate'
      ? {
          strokeDasharray: `${circumference}px`,
          strokeDashoffset: `${circumference * (1 - normalizedValue / max)}px`,
          transition: `stroke-dashoffset 0.3s ${easing}`,
        }
      : undefined

  const ariaProps =
    variant === 'determinate'
      ? { 'aria-valuenow': value, 'aria-valuemin': min, 'aria-valuemax': max }
      : {}

  return (
    <CircularProgressRoot
      role="progressbar"
      aria-label="Loading"
      color={color}
      size={size}
      variant={variant}
      spinning={spinning}
      easing={easing}
      {...ariaProps}
      {...rest}
    >
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} width="100%" height="100%">
        {showTrack && (
          <CircularProgressTrack cx={VIEWBOX / 2} cy={VIEWBOX / 2} r={r} strokeWidth={thickness} />
        )}
        <CircularProgressCircle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={r}
          strokeWidth={thickness}
          style={circleStyle}
          variant={variant}
          disableShrink={disableShrink}
        />
      </svg>
    </CircularProgressRoot>
  )
}
