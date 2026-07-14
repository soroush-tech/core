import { useContext, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { CircularProgress } from '../CircularProgress'
import { ButtonGroupContext } from '../ButtonGroup/ButtonGroupContext'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  layout,
  border,
  typography,
  system,
  variant,
  type SpaceProps,
  type LayoutProps,
  type BorderProps,
  type TypographyProps,
} from '../index'
import { alpha } from '../utils'
export type ButtonVariant = 'contained' | 'outlined' | 'text'
export type ButtonColor = PaletteColor
export type ButtonSize = keyof Theme['sizes']
export type ButtonShape = 'square' | 'rounded' | 'pill'
export type ButtonLoadingPosition = 'start' | 'end' | 'center'
/** Valid values for the gap prop — resolves against theme.space. */
export type GapToken = keyof Theme['space']

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    SpaceProps<Theme>,
    LayoutProps<Theme>,
    BorderProps<Theme>,
    TypographyProps<Theme> {
  /** Visual style — filled, stroked, or ghost. Default: `"contained"`. */
  variant?: ButtonVariant
  /** Color palette — maps to `theme.palette[color]`. Default: `"primary"`. */
  color?: ButtonColor
  /** Size token — controls padding and font size. Default: `"md"`. */
  size?: ButtonSize
  /** Gap between icon and label — resolves against theme.space. Default: `1` (8px). */
  gap?: GapToken
  /** Icon rendered before the label. */
  startIcon?: ReactNode
  /** Icon rendered after the label. */
  endIcon?: ReactNode
  /** Stretch button to full container width. */
  fullWidth?: boolean
  /** Shows loading indicator and disables the button. */
  loading?: boolean
  /** Custom loading element. Default: animated spinner. */
  loadingIndicator?: ReactNode
  /**
   * Corner shape — sets the default `borderRadius`.
   * `"square"` → 0 · `"rounded"` → `theme.radii.md` (default) · `"pill"` → 9999px
   * The `borderRadius` prop always overrides this.
   */
  shape?: ButtonShape
  /** Where the loading indicator appears. Default: `"center"`. */
  loadingPosition?: ButtonLoadingPosition
  /** The URL to link to when the button is clicked. If defined, an `a` element will be used as the root node. */
  href?: string
  /** Anchor `target` — only meaningful when `href` is set. */
  target?: string
  /** Anchor `rel` — only meaningful when `href` is set. */
  rel?: string
}

// 'gap' is not in styled-system's default props list — must be added explicitly
const shouldForwardProp = createShouldForwardProp([
  ...props,
  'gap',
  'variant',
  'size',
  'shape',
  'fullWidth',
  'loading',
  'loadingPosition',
  'startIcon',
  'endIcon',
  'loadingIndicator',
])

// ─── Internal sub-components ──────────────────────────────────────────────────

const ButtonLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== 'invisible',
})<{ invisible?: boolean }>(({ invisible }) => ({
  display: 'inherit',
  alignItems: 'inherit',
  justifyContent: 'inherit',
  // opacity: 0 keeps text in the accessibility tree (unlike visibility: hidden),
  // so the button retains its accessible name while loading.
  ...(invisible && { opacity: 0 }),
}))

const LoadingCenter = styled('span')({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
})

const ButtonIcon = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  flexShrink: 0,
})

// ─── Styling functions ────────────────────────────────────────────────────────

// Truly static — no theme access needed; textTransform is invariant for all buttons
const baseStyles = {
  appearance: 'none' as const,
  outline: 'none',
  cursor: 'pointer',
  position: 'relative' as const,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
  textTransform: 'uppercase' as const,
  // No-op for <button>; strips the default underline when rendered as <a> via href.
  textDecoration: 'none',
  lineHeight: 1,
  transition:
    'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
}

// gap → theme.space  (same pattern as Flex's gapSystem)
const buttonBaseSystem = system({
  gap: { property: 'gap', scale: 'space' },
})

const sizeVariants = ({ theme, size }: ButtonRootProps & { theme: Theme }) => {
  const s = theme.sizes[size]
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
  }
}

const variantStyles = ({
  variant = 'contained',
  color = 'primary',
  theme,
}: ButtonProps & { theme: Theme }) => {
  const { main, dark, contrastText } = theme.palette[color]

  if (variant === 'contained') {
    return {
      backgroundColor: main,
      color: contrastText,
      // Transparent border keeps contained the same size as outlined (border-box accounts for it)
      border: `${theme.borderWidths.thin} solid transparent`,
      '&:hover:not(:disabled)': { backgroundColor: dark },
      '&:active:not(:disabled)': { backgroundColor: dark },
    }
  }

  const hoverBg = alpha(main, 0.08)
  const activeBg = alpha(main, 0.125)
  const borderColor = variant === 'outlined' ? main : 'transparent'
  return {
    backgroundColor: 'transparent',
    color: main,
    border: `${theme.borderWidths.thin} solid ${borderColor}`,
    '&:hover:not(:disabled)': { backgroundColor: hoverBg },
    '&:active:not(:disabled)': { backgroundColor: activeBg },
  }
}

// square → 0  /  rounded → theme.radii.md  /  pill → 9999px
const shapeVariants = variant({
  prop: 'shape',
  variants: {
    square: { borderRadius: 'sq' },
    rounded: { borderRadius: 'md' },
    pill: { borderRadius: '9999px' },
  },
})

const fullWidthStyles = ({ fullWidth }: ButtonProps) => (fullWidth ? { width: '100%' } : {})

// Keyboard-only focus ring in the brand primary color. `outline: none` stays the
// resting base (above), so pointer clicks show no ring.
const focusVisibleStyles = ({ theme }: { theme: Theme }) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
})

// layout's built-in `size` shorthand maps to width+height — strip it so Button's
// own `size` prop (sm/md/lg) doesn't bleed into layout CSS.
const safeLayout = (props: ButtonProps & { theme?: Theme }) => layout({ ...props, size: undefined })

// ─── Styled root ──────────────────────────────────────────────────────────────

type ButtonRootProps = Omit<ButtonProps, 'size'> & { size: ButtonSize }

const ButtonRoot = styled('button', { shouldForwardProp })<ButtonRootProps>(
  baseStyles,
  sizeVariants,
  variantStyles,
  shapeVariants,
  fullWidthStyles,
  focusVisibleStyles,
  space,
  safeLayout,
  buttonBaseSystem,
  typography,
  border
)

// ─── Public component ─────────────────────────────────────────────────────────

export function Button({
  variant,
  color,
  size,
  shape = 'square',
  gap = 1,
  fontWeight = 'bold',
  letterSpacing = 'tight',
  startIcon,
  endIcon,
  fullWidth,
  loading = false,
  loadingIndicator,
  loadingPosition = 'center',
  children,
  disabled,
  href,
  ...rest
}: Readonly<ButtonProps>) {
  // Resolution: explicit prop → enclosing ButtonGroup → default.
  const group = useContext(ButtonGroupContext)
  const resolvedVariant = variant ?? group.variant ?? 'contained'
  const resolvedColor = color ?? group.color ?? 'primary'
  const resolvedSize = size ?? group.size ?? 'md'
  const resolvedFullWidth = fullWidth ?? group.fullWidth ?? false
  const resolvedDisabled = (disabled ?? group.disabled ?? false) || loading

  const indicator = loadingIndicator ?? <CircularProgress size={16} color="inherit" />
  const isCenter = loading && loadingPosition === 'center'
  const start = loading && loadingPosition === 'start' ? indicator : startIcon
  const end = loading && loadingPosition === 'end' ? indicator : endIcon

  return (
    <ButtonRoot
      as={href == null ? undefined : 'a'}
      href={href}
      variant={resolvedVariant}
      color={resolvedColor}
      size={resolvedSize}
      shape={shape}
      gap={gap}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      fullWidth={resolvedFullWidth}
      disabled={resolvedDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {start != null && <ButtonIcon>{start}</ButtonIcon>}
      <ButtonLabel invisible={isCenter}>{children}</ButtonLabel>
      {isCenter && <LoadingCenter>{indicator}</LoadingCenter>}
      {end != null && <ButtonIcon>{end}</ButtonIcon>}
    </ButtonRoot>
  )
}
