import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Icon } from 'src/theme/Icon'
import { styled, type Theme, createShouldForwardProp, get } from 'src/theme'

export type MenuItemColor = keyof Theme['palette']
export type MenuItemSize = keyof Theme['sizes']
export type MenuItemTextColor = keyof Theme['text']

export interface MenuItemProps {
  /** The value this option represents — reported to `Select`'s `onChange`. */
  value: string | number
  /** The option label. */
  children: ReactNode
  /** The element used for the root node — a tag name or a component. Default: `'li'`. */
  as?: ElementType
  /** Disables the option — it cannot be highlighted or selected. */
  disabled?: boolean
  /** Marks the option as the current selection. Injected by `Select`. */
  selected?: boolean
  /** Marks the option as the keyboard-highlighted row. Injected by `Select`. */
  highlighted?: boolean
  /** Reserves a leading checkmark slot for multi-select menus. Injected by `Select`. */
  multiple?: boolean
  /** Accent color — resolves to `theme.palette[color]`. Injected by `Select`; the item's own value wins. Default: `'primary'`. */
  color?: MenuItemColor
  /** Base text color of the row — resolves against `theme.text`. When unset, falls back to the accent color's `main`. Injected by `Select`; the item's own value wins. */
  textColor?: MenuItemTextColor
  /** Density token — resolves against `theme.sizes`. Injected by `Select`. Default: `'md'`. */
  size?: MenuItemSize
  /** Compact vertical padding, independent of `size`. Default: `false`. */
  dense?: boolean
  /** Remove the left and right padding. Default: `false`. */
  disableGutters?: boolean
  /** Add a 1px bottom border to separate the row. Default: `false`. */
  divider?: boolean
  /** Focus the row on first mount, and whenever `autoFocus` flips from `false` to `true`. Default: `false`. */
  autoFocus?: boolean
  /** Class applied only while the row has keyboard focus — a `:focus-visible` hook. */
  focusVisibleClassName?: string
  /** Fired with `value` when the option is chosen. Injected by `Select`. */
  onSelect?: (value: string | number) => void
  id?: string
  className?: string
  'data-testid'?: string
}

interface MenuItemRootProps {
  color: MenuItemColor
  textColor?: MenuItemTextColor
  sizeToken: MenuItemSize
  selected: boolean
  highlighted: boolean
  disabled: boolean
  dense: boolean
  disableGutters: boolean
  divider: boolean
}

const shouldForwardProp = createShouldForwardProp([
  'color',
  'textColor',
  'sizeToken',
  'selected',
  'highlighted',
  'disabled',
  'dense',
  'disableGutters',
  'divider',
])

const baseStyle = ({ theme }: MenuItemRootProps & { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space[1],
  cursor: 'pointer',
  fontFamily: theme.fonts.body,
  lineHeight: theme.lineHeights.base,
  listStyle: 'none',
  userSelect: 'none' as const,
  whiteSpace: 'nowrap' as const,
  transition: 'background-color 0.12s ease',
  outline: 'none',
})

const sizeVariants = ({
  theme,
  sizeToken,
  dense,
  disableGutters,
}: MenuItemRootProps & { theme: Theme }) => {
  const s = theme.sizes[sizeToken]
  const verticalPadding = dense ? theme.space[0.5] : undefined
  return {
    paddingTop: verticalPadding ?? theme.space[s.paddingTop],
    paddingBottom: verticalPadding ?? theme.space[s.paddingBottom],
    paddingLeft: disableGutters ? 0 : theme.space[s.paddingLeft],
    paddingRight: disableGutters ? 0 : theme.space[s.paddingRight],
    fontSize: theme.fontSizes[s.fontSize],
  }
}

const dividerStyle = ({ theme, divider }: MenuItemRootProps & { theme: Theme }) =>
  divider
    ? {
        borderBottomWidth: theme.borderWidths.thin,
        borderBottomStyle: 'solid' as const,
        borderBottomColor: get(theme, 'border.light'),
      }
    : {}

// Hover/selected shading is derived from the accent palette so menus stay on-theme
// in both color schemes. Opacity is expressed with a hex suffix, never `rgba()`.
const interactionStyles = ({
  theme,
  color,
  textColor,
  selected,
  highlighted,
  disabled,
}: MenuItemRootProps & { theme: Theme }) => {
  const main = get(theme, `palette.${color}.main`)
  const hoverBg = `${main}1F`
  const selectedBg = `${main}29`
  const activeSelectedBg = `${main}3D`

  if (disabled) {
    return {
      color: get(theme, 'text.disabled'),
      cursor: 'not-allowed',
      pointerEvents: 'none' as const,
    }
  }

  const baseColor = textColor ? get(theme, `text.${textColor}`) : main
  const selectedBackground = highlighted ? activeSelectedBg : selectedBg
  const idleBackground = highlighted ? hoverBg : 'transparent'
  return {
    color: selected ? main : baseColor,
    backgroundColor: selected ? selectedBackground : idleBackground,
    '&:hover': {
      backgroundColor: selected ? activeSelectedBg : hoverBg,
    },
  }
}

const MenuItemRoot = styled('li', { label: 'MenuItem', shouldForwardProp })<MenuItemRootProps>(
  baseStyle,
  sizeVariants,
  dividerStyle,
  interactionStyles
)

// A fixed-width slot keeps labels aligned whether or not the checkmark is shown.
const CheckSlot = styled('span')({
  display: 'inline-flex',
  width: '1.125rem',
  flexShrink: 0,
})

// `:focus-visible` isn't universally supported by `matches()` (older jsdom throws),
// so treat an unsupported environment as "not keyboard focus".
function isKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(':focus-visible')
  } catch {
    return false
  }
}

/**
 * @description A single option row for `Select`'s listbox. Rendered as a semantic
 * `<li role="option">` (override via `as`). Selection/highlight/density props are
 * injected by `Select`; used on its own it renders a static, styled row.
 */
export function MenuItem({
  value,
  children,
  as,
  disabled = false,
  selected = false,
  highlighted = false,
  multiple = false,
  color = 'primary',
  textColor,
  size = 'md',
  dense = false,
  disableGutters = false,
  divider = false,
  autoFocus = false,
  focusVisibleClassName,
  onSelect,
  id,
  className,
  'data-testid': dataTestid,
}: Readonly<MenuItemProps>) {
  const rootRef = useRef<HTMLLIElement>(null)
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    if (autoFocus) {
      rootRef.current?.focus()
    }
  }, [autoFocus])

  const handleClick = () => {
    if (!disabled) {
      onSelect?.(value)
    }
  }

  // Keep focus on the combobox trigger so its `aria-activedescendant` model holds.
  const handleMouseDown = (event: MouseEvent<HTMLLIElement>) => {
    event.preventDefault()
  }

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (focusVisibleClassName && isKeyboardFocus(event.currentTarget)) {
      setIsFocusVisible(true)
    }
  }

  const handleBlur = () => {
    setIsFocusVisible(false)
  }

  const rootClassName =
    [className, isFocusVisible ? focusVisibleClassName : undefined].filter(Boolean).join(' ') ||
    undefined

  return (
    <MenuItemRoot
      as={as}
      ref={rootRef}
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-value={value}
      color={color}
      textColor={textColor}
      sizeToken={size}
      selected={selected}
      highlighted={highlighted}
      disabled={disabled}
      dense={dense}
      disableGutters={disableGutters}
      divider={divider}
      className={rootClassName}
      data-testid={dataTestid}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {multiple && (
        <CheckSlot aria-hidden>
          {selected && <Icon name="check" size="1.125rem" color="inherit" />}
        </CheckSlot>
      )}
      {children}
    </MenuItemRoot>
  )
}
