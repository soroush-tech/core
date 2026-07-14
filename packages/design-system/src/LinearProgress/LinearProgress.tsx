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

export type LinearProgressVariant = 'indeterminate' | 'determinate' | 'query'
export type LinearProgressColor = ButtonColor | 'inherit'
export type LinearProgressEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

export interface LinearProgressProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    Omit<SpaceProps<Theme>, keyof PaddingProps>,
    LayoutProps<Theme> {
  /** Visual variant — looping animation, value-driven bar, or reversed loop. Default: `'indeterminate'`. */
  variant?: LinearProgressVariant
  /** Bar color — resolves to `theme.palette[color].main`; `'inherit'` uses `currentColor`. Default: `'primary'`. */
  color?: LinearProgressColor
  /** Bar height. Number → px; string → raw CSS unit (e.g. `'0.5rem'`). Default: `4`. */
  thickness?: number | string
  /** Progress value for the `'determinate'` variant. Clamped between `min` and `max`. */
  value?: number
  /** Renders a buffer bar driven by `valueBuffer` behind a `'determinate'` bar, with a dotted leading edge. */
  buffer?: boolean
  /** Buffer value when `buffer` is set. Clamped between `min` and `max`. */
  valueBuffer?: number
  /** Minimum value for `'determinate'`. Default: `0`. */
  min?: number
  /** Maximum value for `'determinate'`. Default: `100`. */
  max?: number
  /** Sends the value-length segment travelling along a `'determinate'` track, wrapping past the end back to the beginning. */
  spinning?: boolean
  /** Timing function for the value transition and the `spinning` glint. Default: `'linear'`. */
  easing?: LinearProgressEasing
  /** Renders the faint track behind the bars (dotted edge when `buffer` is set). Default: `true`. */
  showTrack?: boolean
  /** Rounds the bar's corners into a pill shape. Default: `false`. */
  round?: boolean
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'color',
  'variant',
  'thickness',
  'value',
  'buffer',
  'valueBuffer',
  'min',
  'max',
  'spinning',
  'easing',
  'showTrack',
  'round',
])

const THICKNESS_DEFAULT = 4

const indeterminateBar1 = keyframes({
  '0%': { left: '-35%', right: '100%' },
  '60%': { left: '100%', right: '-90%' },
  '100%': { left: '100%', right: '-90%' },
})

const indeterminateBar2 = keyframes({
  '0%': { left: '-200%', right: '100%' },
  '60%': { left: '107%', right: '-8%' },
  '100%': { left: '107%', right: '-8%' },
})

const bufferDots = keyframes({
  '0%': { opacity: 1, backgroundPosition: '0 -23px' },
  '60%': { opacity: 0, backgroundPosition: '0 -23px' },
  '100%': { opacity: 1, backgroundPosition: '-200px -23px' },
})

const travel = keyframes({
  '0%': { transform: 'translateX(0%)' },
  '100%': { transform: 'translateX(100%)' },
})

// ─── Internal sub-components ──────────────────────────────────────────────────

const LinearProgressTrack = styled('span')({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'currentColor',
  opacity: 0.2,
})

// Dotted leading edge for the buffer mode — replaces the solid track.
// currentColor keeps it on the resolved theme color without extra tokens.
const LinearProgressDash = styled('span')({
  position: 'absolute',
  inset: 0,
  backgroundImage: 'radial-gradient(currentColor 0%, currentColor 16%, transparent 42%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 -23px',
  opacity: 0.3,
  animation: `${bufferDots} 3s infinite linear`,
})

type BarProps = Pick<LinearProgressProps, 'variant' | 'buffer' | 'easing'>

const barShouldForwardProp = (prop: string) =>
  prop !== 'variant' && prop !== 'buffer' && prop !== 'easing'

// Primary bar — animated for indeterminate/query, transform-driven for determinate.
const LinearProgressBar = styled('span', {
  shouldForwardProp: barShouldForwardProp,
})<BarProps>(({ variant, easing = 'linear' }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  transformOrigin: 'left',
  backgroundColor: 'currentColor',
  ...(variant === 'determinate'
    ? { width: '100%', transition: `transform 0.4s ${easing}` }
    : { animation: `${indeterminateBar1} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite` }),
}))

// Wrap-around carrier for determinate + spinning. It holds two value-length
// segments one full track width apart; translating the carrier by 100% moves
// both, so the copy re-enters at the start exactly as the lead exits the end.
const LinearProgressTraveler = styled('span', {
  shouldForwardProp: barShouldForwardProp,
})<Pick<LinearProgressProps, 'easing'>>(({ easing = 'linear' }) => ({
  position: 'absolute',
  inset: 0,
  animation: `${travel} 1.4s ${easing} infinite`,
}))

const LinearProgressSegment = styled('span')({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'currentColor',
})

// Secondary bar — delayed animation for indeterminate/query, buffer amount in buffer mode.
const LinearProgressBarSecondary = styled('span', {
  shouldForwardProp: barShouldForwardProp,
})<BarProps>(({ buffer, easing = 'linear' }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  transformOrigin: 'left',
  backgroundColor: 'currentColor',
  ...(buffer
    ? { width: '100%', opacity: 0.4, transition: `transform 0.4s ${easing}` }
    : {
        animation: `${indeterminateBar2} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`,
      }),
}))

// ─── Styling functions ────────────────────────────────────────────────────────

const colorStyle = ({ color = 'primary', theme }: LinearProgressProps & { theme?: Theme }) => {
  if (!theme || color === 'inherit') return {}
  return { color: theme.palette[color].main }
}

const baseStyle = {
  display: 'block',
  position: 'relative' as const,
  overflow: 'hidden',
  width: '100%',
}

const thicknessStyle = ({ thickness = THICKNESS_DEFAULT }: LinearProgressProps) => ({
  height: thickness,
})

// Query renders the indeterminate animation reversed by flipping the whole bar.
const directionStyle = ({ variant = 'indeterminate' }: LinearProgressProps) =>
  variant === 'query' ? { transform: 'rotate(180deg)' } : {}

// Pill corners — same literal Button uses for its pill shape. overflow:hidden
// on the root clips the bars to the radius.
const roundStyle = ({ round }: LinearProgressProps) => (round ? { borderRadius: '9999px' } : {})

// ─── Styled root ──────────────────────────────────────────────────────────────

const LinearProgressRoot = styled('span', { shouldForwardProp })<LinearProgressProps>(
  baseStyle,
  thicknessStyle,
  colorStyle,
  directionStyle,
  roundStyle,
  space,
  layout
)

// ─── Public component ─────────────────────────────────────────────────────────

export function LinearProgress({
  variant = 'indeterminate',
  color = 'primary',
  thickness = THICKNESS_DEFAULT,
  value,
  buffer = false,
  valueBuffer,
  min = 0,
  max = 100,
  spinning = false,
  easing = 'linear',
  showTrack = true,
  round = false,
  ...rest
}: Readonly<LinearProgressProps>) {
  const isDeterminate = variant === 'determinate'
  const isBuffer = isDeterminate && buffer
  const isSpinning = isDeterminate && spinning
  const normalizedValue = clamp(value ?? min, min, max)
  const normalizedBuffer = clamp(valueBuffer ?? min, min, max)
  // Guard against max === 0, which would make the ratio NaN and break the transform.
  const toPercent = (n: number) => (max === 0 ? 0 : (n / max) * 100)
  const valuePercent = toPercent(normalizedValue)

  const barStyle = isDeterminate ? { transform: `translateX(${valuePercent - 100}%)` } : undefined

  const bufferBarStyle = isBuffer
    ? { transform: `translateX(${toPercent(normalizedBuffer) - 100}%)` }
    : undefined

  const ariaProps = isDeterminate
    ? { 'aria-valuenow': normalizedValue, 'aria-valuemin': min, 'aria-valuemax': max }
    : {}

  return (
    <LinearProgressRoot
      role="progressbar"
      aria-label="Loading"
      color={color}
      variant={variant}
      thickness={thickness}
      round={round}
      {...ariaProps}
      {...rest}
    >
      {showTrack && (isBuffer ? <LinearProgressDash /> : <LinearProgressTrack />)}
      {(!isDeterminate || isBuffer) && (
        <LinearProgressBarSecondary buffer={isBuffer} easing={easing} style={bufferBarStyle} />
      )}
      {isSpinning ? (
        <LinearProgressTraveler easing={easing}>
          <LinearProgressSegment style={{ width: `${valuePercent}%` }} />
          <LinearProgressSegment style={{ width: `${valuePercent}%`, left: '-100%' }} />
        </LinearProgressTraveler>
      ) : (
        <LinearProgressBar variant={variant} easing={easing} style={barStyle} />
      )}
    </LinearProgressRoot>
  )
}
