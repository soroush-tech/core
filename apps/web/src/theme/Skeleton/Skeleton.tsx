import { type HTMLAttributes } from 'react'
import {
  styled,
  type Theme,
  keyframes,
  createShouldForwardProp,
  props,
  space,
  system,
  type SpaceProps,
  type PaddingProps,
  variant as styledVariant,
} from 'src/theme'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular'
export type SkeletonAnimation = 'pulse' | 'wave' | false
export type SkeletonRadius = keyof Theme['radii']

export interface SkeletonProps
  extends HTMLAttributes<HTMLSpanElement>, Omit<SpaceProps<Theme>, keyof PaddingProps> {
  /** Shape of the placeholder. Default: `'text'`. */
  variant?: SkeletonVariant
  /** Corner radius — resolves against `theme.radii` (sq · sm · md · lg). Overrides the variant default. */
  borderRadius?: SkeletonRadius
  /** Loading animation. `false` disables it. Default: `'pulse'`. */
  animation?: SkeletonAnimation
  /** Width. Number → px; string → raw CSS unit (e.g. `'10rem'`). Inferred from children when omitted. */
  width?: number | string
  /** Height. Number → px; string → raw CSS unit. */
  height?: number | string
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'variant',
  'animation',
  'width',
  'height',
])

// Opacity fade — size-independent, so every skeleton on the page reads identically.
const pulse = keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.4 },
  '100%': { opacity: 1 },
})

// Sweeps the shimmer band across the viewport, not the element — see animationStyle's wave branch.
const wave = keyframes({
  from: { backgroundPositionX: '100vw' },
  to: { backgroundPositionX: '-100vw' },
})

// Default corner radius for the non-circular shapes. An explicit borderRadius prop overrides these.
// text → theme.radii.sm  /  rectangular → theme.radii.sq (0)
const shapeVariants = styledVariant({
  prop: 'variant',
  variants: {
    text: { borderRadius: 'sm' },
    rectangular: { borderRadius: 'sq' },
  },
})

// borderRadius → theme.radii scale. Composed after shapeVariants so it overrides.
const radiusSystem = system({
  borderRadius: { property: 'borderRadius', scale: 'radii' },
})

// A circle stays a circle — 50% always wins, even over an explicit borderRadius. Composed last of the radius rules.
const circularStyle = ({ variant }: SkeletonProps) =>
  variant === 'circular' ? { borderRadius: '50%' } : {}

const baseStyle = ({ theme }: SkeletonProps & { theme: Theme }) => ({
  display: 'block',
  backgroundColor: theme.background.default,
})

// Number → px (emotion default); string → raw. Empty text skeletons get a line's height via the nbsp trick.
const dimensionStyle = ({ width, height, variant }: SkeletonProps) => ({
  width,
  height: height ?? (variant === 'text' ? 'auto' : undefined),
  ...(variant === 'text' && height === undefined
    ? { '&:empty::before': { content: String.raw`"\00a0"` } }
    : {}),
})

const animationStyle = ({ animation, theme }: SkeletonProps & { theme: Theme }) => {
  if (animation === 'pulse') {
    return { animation: `${pulse} 2s ease-in-out infinite` }
  }
  if (animation === 'wave') {
    // The gradient is anchored to the viewport (background-attachment: fixed), so one
    // shimmer band sweeps across the whole page. Each skeleton reveals the slice under
    // it, keeping wide and narrow skeletons visually in sync regardless of their size.
    return {
      backgroundImage: `linear-gradient(90deg, transparent, ${theme.skeleton.highlight}, transparent)`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '50vw 100%',
      backgroundAttachment: 'fixed',
      animation: `${wave} 1.6s linear infinite`,
    }
  }
  return {}
}

const reducedMotionStyle = {
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}

const SkeletonRoot = styled('span', { label: 'skeleton', shouldForwardProp })<SkeletonProps>(
  baseStyle,
  shapeVariants,
  radiusSystem,
  circularStyle,
  animationStyle,
  dimensionStyle,
  space,
  reducedMotionStyle
)

// Sizes the skeleton to its children while keeping them invisible.
const HiddenContent = styled('span')({ visibility: 'hidden', display: 'block' })

export function Skeleton({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  children,
  ...rest
}: Readonly<SkeletonProps>) {
  const hasChildren = children != null && children !== ''
  const resolvedWidth = width ?? (hasChildren ? 'fit-content' : undefined)

  return (
    <SkeletonRoot
      variant={variant}
      animation={animation}
      width={resolvedWidth}
      height={height}
      {...rest}
    >
      {hasChildren ? <HiddenContent>{children}</HiddenContent> : null}
    </SkeletonRoot>
  )
}
