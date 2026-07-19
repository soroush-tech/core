import { type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  type SpaceProps,
} from '../index'
import { useTheme } from '../theme'
import { alpha } from '../utils'
import { themeDefault } from '../theme/utils/themeDefault'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SwitchColor = keyof Theme['palette']
export type SwitchSize = keyof Theme['sizes']
export type SwitchEdge = 'start' | 'end' | false
export type SwitchVariant = 'outside' | 'inside'

export interface SwitchProps extends SpaceProps<Theme> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  /** Accepted for API parity — the design system does not implement ripple. */
  disableRipple?: boolean
  color?: SwitchColor
  size?: SwitchSize
  variant?: SwitchVariant
  bg?: keyof Theme['background']
  /**
   * Shows ✓/✕ indicators.
   * - `"outside"` — marks appear as SVG icons inside the thumb.
   * - `"inside"` — marks appear as CSS pseudo-elements in the track.
   * Custom `icon`/`checkedIcon` override the defaults when `marked` is true.
   */
  marked?: boolean
  edge?: SwitchEdge
  icon?: ReactNode
  checkedIcon?: ReactNode
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  id?: string
  required?: boolean
  children?: ReactNode
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'data-testid'?: string
}

// ─── Size constants ───────────────────────────────────────────────────────────

// outside: thumb overflows track both vertically and horizontally by 2px (MUI-style).
// Translate = trackWidth - thumbSize + 2×overflow(2px)
//   sm: 34-20+4=18  md: 44-24+4=24  lg: 54-28+4=30
const OUTSIDE_TRACK: Record<SwitchSize, { width: string; height: string }> = {
  sm: { width: '34px', height: '14px' },
  md: { width: '44px', height: '18px' },
  lg: { width: '54px', height: '22px' },
}
const OUTSIDE_THUMB: Record<SwitchSize, string> = { sm: '20px', md: '24px', lg: '28px' }
const OUTSIDE_THUMB_START: Record<SwitchSize, string> = { sm: '-2px', md: '-2px', lg: '-2px' }
const OUTSIDE_TRANSLATE: Record<SwitchSize, string> = { sm: '18px', md: '24px', lg: '30px' }

// inside: thumb contained within the track (iOS-style).
// Thumb = trackHeight - 2×startGap(2px). Translate = trackWidth - thumbSize - 2×startGap
//   sm: 36-16-4=16  md: 46-22-4=20  lg: 56-28-4=24
const INSIDE_TRACK: Record<SwitchSize, { width: string; height: string }> = {
  sm: { width: '36px', height: '20px' },
  md: { width: '46px', height: '26px' },
  lg: { width: '56px', height: '32px' },
}
const INSIDE_THUMB: Record<SwitchSize, string> = { sm: '16px', md: '22px', lg: '28px' }
const INSIDE_THUMB_START: Record<SwitchSize, string> = { sm: '2px', md: '2px', lg: '2px' }
const INSIDE_TRANSLATE: Record<SwitchSize, string> = { sm: '16px', md: '20px', lg: '24px' }

// Resolves the effective size (prop → theme.defaults.size → 'md') to a metric key.
// Sizes added by theme augmentation have no metrics here — fall back to md.
const knownSize = (size: SwitchSize | undefined, theme: Theme): 'sm' | 'md' | 'lg' => {
  const resolved = size ?? themeDefault(theme, 'size', 'md')
  return resolved === 'sm' || resolved === 'lg' ? resolved : 'md'
}

// ─── Mark icons (outside + marked) ───────────────────────────────────────────

const CheckMarkIcon = () => (
  <svg viewBox="0 0 12 12" width="0.6em" height="0.6em" fill="none" aria-hidden="true">
    <path
      d="M2 6L5 9L10 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const XMarkIcon = () => (
  <svg viewBox="0 0 12 12" width="0.6em" height="0.6em" fill="none" aria-hidden="true">
    <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

// ─── HiddenInput ─────────────────────────────────────────────────────────────

const HiddenInput = styled('input', { name: 'Switch', slot: 'input', label: 'SwitchInput' })({
  position: 'absolute',
  width: 0,
  height: 0,
  opacity: 0,
  margin: 0,
  padding: 0,
  pointerEvents: 'none',
})

// ─── SwitchTrack ─────────────────────────────────────────────────────────────

const SwitchTrack = styled('span', {
  name: 'Switch',
  slot: 'track',
  label: 'SwitchTrack',
  shouldForwardProp: (p) => p !== 'size' && p !== 'variant' && p !== 'bg',
})<{
  size?: SwitchSize
  variant?: SwitchVariant
  bg?: keyof Theme['background']
}>(({ theme, size, variant = 'outside', bg = themeDefault(theme, 'bg', 'default') }) => {
  const trackBg = theme.background[bg]
  if (variant === 'outside') {
    // Track element is a wrapper (height = thumbSize).
    // The visual pill lives in ::before (height = trackHeight, centered).
    return {
      display: 'inline-block',
      position: 'relative' as const,
      flexShrink: 0,
      width: OUTSIDE_TRACK[knownSize(size, theme)].width,
      height: OUTSIDE_THUMB[knownSize(size, theme)],
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: '50%',
        left: 0,
        right: 0,
        height: OUTSIDE_TRACK[knownSize(size, theme)].height,
        transform: 'translateY(-50%)',
        borderRadius: '999px',
        backgroundColor: trackBg,
        transition: 'background-color 0.15s ease',
      },
    }
  }

  // inside: track IS the full pill
  return {
    display: 'inline-block',
    position: 'relative' as const,
    flexShrink: 0,
    width: INSIDE_TRACK[knownSize(size, theme)].width,
    height: INSIDE_TRACK[knownSize(size, theme)].height,
    borderRadius: '999px',
    backgroundColor: trackBg,
    transition: 'background-color 0.3s ease',
  }
})

// ─── SwitchThumb ─────────────────────────────────────────────────────────────

const SwitchThumb = styled('span', {
  name: 'Switch',
  slot: 'thumb',
  label: 'SwitchThumb',
  shouldForwardProp: (p) => p !== 'size' && p !== 'variant',
})<{ size?: SwitchSize; variant?: SwitchVariant }>(({ size, variant = 'outside', theme }) => {
  const thumbSize =
    variant === 'outside'
      ? OUTSIDE_THUMB[knownSize(size, theme)]
      : INSIDE_THUMB[knownSize(size, theme)]
  const thumbStart =
    variant === 'outside'
      ? OUTSIDE_THUMB_START[knownSize(size, theme)]
      : INSIDE_THUMB_START[knownSize(size, theme)]
  const transitionDuration = variant === 'inside' ? '0.3s' : '0.15s'

  return {
    position: 'absolute' as const,
    top: '50%',
    left: thumbStart,
    transform: 'translateY(-50%)',
    width: thumbSize,
    height: thumbSize,
    borderRadius: '50%',
    backgroundColor: theme.switch.thumb,
    boxShadow: `0px 2px 1px -1px ${alpha(theme.shadow.color, 0.2)},0px 1px 1px 0px ${alpha(theme.shadow.color, 0.14)},0px 1px 3px 0px ${alpha(theme.shadow.color, 0.12)}`,
    transition: `transform ${transitionDuration} ease, background-color ${transitionDuration} ease`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontSize: thumbSize,
    lineHeight: 1,
    zIndex: 1,
  }
})

// ─── SwitchRoot ───────────────────────────────────────────────────────────────

interface SwitchRootProps extends SpaceProps<Theme> {
  color?: SwitchColor
  size?: SwitchSize
  variant?: SwitchVariant
  disabled?: boolean
  edge?: SwitchEdge
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'color',
  'size',
  'variant',
  'disabled',
  'edge',
])

const baseStyle = ({
  disabled,
  size,
  variant = 'outside',
  theme,
  color = themeDefault(theme, 'neutralColor', 'default'),
}: SwitchRootProps & { theme: Theme }) => {
  const focusRing = theme.palette[themeDefault(theme, 'color', 'primary')].main
  const thumbTranslate =
    variant === 'outside'
      ? OUTSIDE_TRANSLATE[knownSize(size, theme)]
      : INSIDE_TRANSLATE[knownSize(size, theme)]
  const gap = theme?.space?.[1]

  return {
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative' as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    gap,
    userSelect: 'none' as const,
    ...(variant === 'outside' && {
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8,
    }),
    ...(disabled && { opacity: 0.5 }),
    ...(variant === 'outside'
      ? {
          '& input:checked ~ .sw-track::before': { backgroundColor: theme?.palette[color].dark },
          '&:has(input:focus-visible) .sw-track::before': {
            outline: `2px solid ${focusRing}`,
            outlineOffset: '2px',
            borderRadius: '999px',
          },
        }
      : {
          '& input:checked ~ .sw-track': { backgroundColor: theme?.palette[color].dark },
          '&:has(input:focus-visible) .sw-track': {
            outline: `2px solid ${focusRing}`,
            outlineOffset: '2px',
            borderRadius: '999px',
          },
        }),
    '& input:checked ~ .sw-track .sw-thumb': {
      transform: `translateX(${thumbTranslate}) translateY(-50%)`,
      backgroundColor: theme?.palette[color].main,
    },
    '& input:not(:checked) ~ .sw-track .sw-checked-icon': { display: 'none' },
    '& input:checked ~ .sw-track .sw-icon': { display: 'none' },
    '& .sw-track .sw-icon': { color: theme?.palette.default.contrastText, lineHeight: 0 },
    '& .sw-track .sw-checked-icon': { color: theme?.palette[color].contrastText, lineHeight: 0 },
    '& .sw-track .sw-track-check': {
      position: 'absolute' as const,
      left: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      lineHeight: 0,
      pointerEvents: 'none' as const,
      color: theme?.palette[color].contrastText,
    },
    '& .sw-track .sw-track-x': {
      position: 'absolute' as const,
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      lineHeight: 0,
      pointerEvents: 'none' as const,
      color: theme?.palette.default.contrastText,
    },
  }
}

const colorStyle = ({
  theme,
  color = themeDefault(theme, 'neutralColor', 'default'),
}: SwitchRootProps & { theme: Theme }) => {
  return {
    color: theme.palette[color].main,
  }
}

const edgeStyle = ({ edge }: SwitchRootProps) => {
  if (!edge) return {}
  return {
    ...(edge === 'start' && { marginLeft: -8 }),
    ...(edge === 'end' && { marginRight: -8 }),
  }
}

const SwitchRoot = styled('label', {
  name: 'Switch',
  label: 'Switch',
  shouldForwardProp,
  systemProps: [space],
})<SwitchRootProps>(baseStyle, colorStyle, edgeStyle)

// ─── Public component ─────────────────────────────────────────────────────────

export function Switch({
  checked,
  defaultChecked,
  disabled = false,
  disableRipple: _disableRipple,
  // undefined color/size resolve to theme.defaults in the styled layer.
  color,
  size,
  variant: variantProp,
  marked = false,
  bg,
  edge = false,
  icon,
  checkedIcon,
  onChange,
  id,
  required,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'data-testid': dataTestid,
  ...spaceProps
}: Readonly<SwitchProps>) {
  const theme = useTheme()
  const variant = variantProp ?? themeDefault(theme, 'switchVariant', 'outside')
  // outside + marked: inject default SVG mark icons unless the caller overrides them.
  const effectiveIcon = icon ?? (marked && variant === 'outside' ? <XMarkIcon /> : null)
  const effectiveCheckedIcon =
    checkedIcon ?? (marked && variant === 'outside' ? <CheckMarkIcon /> : null)

  // The native checkbox already toggles on Space; add Enter for ARIA switch parity.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.currentTarget.click()
  }

  return (
    <SwitchRoot
      color={color}
      size={size}
      variant={variant}
      disabled={disabled}
      edge={edge}
      className={className}
      data-testid={dataTestid}
      {...spaceProps}
    >
      <HiddenInput
        type="checkbox"
        role="switch"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
        required={required}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
      />
      <SwitchTrack className="sw-track" size={size} variant={variant} bg={bg}>
        {variant === 'inside' && marked && (
          <>
            <span className="sw-track-check">
              <CheckMarkIcon />
            </span>
            <span className="sw-track-x">
              <XMarkIcon />
            </span>
          </>
        )}
        <SwitchThumb className="sw-thumb" size={size} variant={variant}>
          {effectiveIcon != null && <span className="sw-icon">{effectiveIcon}</span>}
          {effectiveCheckedIcon != null && (
            <span className="sw-checked-icon">{effectiveCheckedIcon}</span>
          )}
        </SwitchThumb>
      </SwitchTrack>
      {children != null && <span>{children}</span>}
    </SwitchRoot>
  )
}
