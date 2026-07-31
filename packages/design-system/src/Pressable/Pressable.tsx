import {
  type ButtonHTMLAttributes,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
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
  type SpaceProps,
  type LayoutProps,
  type BorderProps,
  type TypographyProps,
} from '../index'
import { alpha } from '../utils'
import { themeDefault } from '../theme/utils/themeDefault'
import { useDefaultProps, useTheme } from '../theme'

/**
 * Press feedback: `none` leaves the wrapped content untouched, `opacity` dims it
 * while held, `highlight` tints the surface behind it while held.
 */
export type PressableFeedback = 'none' | 'opacity' | 'highlight'
export type PressableColor = PaletteColor

export interface PressableProps
  extends
    Omit<ButtonHTMLAttributes<HTMLElement>, 'color'>,
    SpaceProps<Theme>,
    LayoutProps<Theme>,
    BorderProps<Theme>,
    TypographyProps<Theme> {
  /**
   * Element to render. Default: `'div'` — which still behaves as a button
   * (`role`, tab stop, Enter/Space) because a `<button>` may not legally contain
   * links, buttons, or block-level content. Pass `'button'` for a native button
   * when the content is phrasing-only, or any other tag you need.
   */
  as?: ElementType
  /** Feedback shown while pressed. Default: `'none'`, overridable via `theme.components.Pressable.defaultProps`. */
  feedback?: PressableFeedback
  /** Palette the `highlight` tint derives from — maps to `theme.palette[color]`. Default: `'primary'`, overridable via `theme.defaults.color`. */
  color?: PressableColor
  /** Opacity held content fades to under `feedback="opacity"`. Default: `0.7`. */
  activeOpacity?: number
  /** The URL to link to. If defined and `as` is unset, an `a` element is used. */
  href?: string
  /** Anchor `target` — only meaningful when `href` is set. */
  target?: string
  /** Anchor `rel` — only meaningful when `href` is set. */
  rel?: string
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'feedback',
  'activeOpacity',
  'isDisabled',
])

// The root always receives the resolved values from `Pressable`, so the style
// functions can read them without re-defaulting. `isDisabled` is separate from
// the `disabled` attribute, which only a native button accepts.
type PressableRootProps = PressableProps & {
  feedback: PressableFeedback
  color: PressableColor
  activeOpacity: number
  isDisabled: boolean
}

// ─── Styling functions ────────────────────────────────────────────────────────

// Strips every native affordance so the element contributes semantics and nothing
// else — no padding, margin, border, background, or font of its own — and whatever
// it wraps lays out exactly as it would unwrapped. Spacing is opt-in through the
// space/layout/border props, which run last and therefore win.
const baseStyles = {
  appearance: 'none' as const,
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'inherit' as const,
  // No-op for <button>; strips the default underline when rendered as <a> via href.
  textDecoration: 'none',
  outline: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  // A native button's text can't be selected by dragging or double-clicking, but
  // a shimmed div's can — this keeps every rendered element pressing like a
  // control rather than reading like a paragraph.
  userSelect: 'none' as const,
  transition: 'background-color 0.15s ease, opacity 0.15s ease',
  // Two selectors because `:disabled` never matches a non-form element — the
  // shimmed elements carry `aria-disabled` instead.
  '&:disabled, &[aria-disabled="true"]': {
    cursor: 'not-allowed',
  },
}

// Press-only, matching the Touchable family it mirrors: feedback appears while the
// control is held and nothing shows on hover, leaving hover styling to the consumer.
// Gated on the prop rather than `:not(:disabled)`, which a shimmed element defeats.
const feedbackStyles = ({
  theme,
  feedback,
  color,
  activeOpacity,
  isDisabled,
}: PressableRootProps & { theme: Theme }) => {
  if (isDisabled || feedback === 'none') {
    return {}
  }
  if (feedback === 'opacity') {
    return { '&:active': { opacity: activeOpacity } }
  }
  return { '&:active': { backgroundColor: alpha(theme.palette[color].main, 0.125) } }
}

// Keyboard-only focus ring in the brand primary color. `outline: none` stays the
// resting base (above), so pointer clicks show no ring.
const focusVisibleStyles = ({ theme }: { theme: Theme }) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette[themeDefault(theme, 'color', 'primary')].main}`,
    outlineOffset: '2px',
  },
})

// ─── Styled root ──────────────────────────────────────────────────────────────

const PressableRoot = styled('div', {
  name: 'Pressable',
  label: 'Pressable',
  shouldForwardProp,
  // Styled-system parsers run after theme styleOverrides/variants, so
  // per-instance props (m, p, width, …) always beat the theme.
  systemProps: [space, layout, typography, border],
})<PressableRootProps>(baseStyles, feedbackStyles, focusVisibleStyles)

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * An unstyled clickable surface — button semantics (keyboard activation, focus
 * ring, disabled state) with none of a button's looks, so it can wrap arbitrary
 * content without changing its layout. Use it instead of an `onClick` on a
 * `div`, which no keyboard or screen-reader user can reach.
 *
 * It renders a `div` by default, because `<button>` may not legally contain a
 * link, another button, or block-level content — the shim gives that div a
 * `role`, a tab stop, and Enter/Space activation, so it is announced and
 * operated as a button either way. Pass `as="button"` for a native button, or
 * `href` for an anchor; both skip the shim and let the browser do the work.
 *
 * `feedback` picks what happens while it is held: nothing (default), the content
 * dims, or the surface tints.
 */
export function Pressable({
  as,
  feedback,
  color,
  activeOpacity,
  href,
  type = 'button',
  disabled = false,
  onClick,
  onKeyDown,
  onKeyUp,
  ...rest
}: Readonly<PressableProps>) {
  // Resolution: explicit prop → theme.components.Pressable.defaultProps
  // → theme.defaults.* → literal fallback.
  const theme = useTheme()
  const dp = useDefaultProps('Pressable')
  const resolvedFeedback = feedback ?? dp.feedback ?? 'none'
  const resolvedColor = color ?? dp.color ?? themeDefault(theme, 'color', 'primary')
  const resolvedActiveOpacity = activeOpacity ?? dp.activeOpacity ?? 0.7

  const element = as ?? (href == null ? 'div' : 'a')
  const isButton = element === 'button'
  // The browser activates buttons and anchors on its own; every other element
  // needs the role, the tab stop, and Enter/Space written out by hand.
  const needsShim = !isButton && element !== 'a'

  const activate = (event: KeyboardEvent<HTMLElement>) => {
    event.preventDefault()
    event.currentTarget.click()
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // A native button ignores clicks while disabled; a shimmed element does not.
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (disabled) {
      return
    }
    if (event.key === 'Enter') {
      activate(event)
    } else if (event.key === ' ') {
      // Space scrolls the page by default. Block that here and fire on keyup,
      // which is when a native button activates.
      event.preventDefault()
    }
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    onKeyUp?.(event)
    if (!disabled && event.key === ' ') {
      activate(event)
    }
  }

  const shimProps = needsShim
    ? {
        role: 'button',
        tabIndex: disabled ? -1 : 0,
        'aria-disabled': disabled || undefined,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp,
      }
    : { onKeyDown, onKeyUp }

  return (
    <PressableRoot
      as={element}
      href={href}
      // Attributes only a native button understands — invalid anywhere else.
      type={isButton ? type : undefined}
      disabled={isButton ? disabled : undefined}
      feedback={resolvedFeedback}
      color={resolvedColor}
      activeOpacity={resolvedActiveOpacity}
      isDisabled={disabled}
      onClick={handleClick}
      {...shimProps}
      {...rest}
    />
  )
}
