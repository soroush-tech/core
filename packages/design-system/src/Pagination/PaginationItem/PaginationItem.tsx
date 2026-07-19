import { type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react'
import { Icon, type IconName } from '@soroush.tech/design-system/Icon'
import { type PaginationItemType } from '../hooks/usePagination'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  get,
  type SpaceProps,
} from '@soroush.tech/design-system'
import { alpha } from '@soroush.tech/design-system/utils'
import { themeDefault } from '@soroush.tech/design-system/theme'

export type PaginationItemColor = PaletteColor
export type PaginationItemVariant = 'text' | 'outlined'
export type PaginationItemShape = 'circular' | 'rounded'
export type PaginationItemSize = keyof Theme['sizes']

export interface PaginationItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>, SpaceProps<Theme> {
  /** What the item renders — a page number, a nav control, or a non-interactive ellipsis. */
  type?: PaginationItemType
  /** The page number/content for `type="page"`. */
  page?: ReactNode
  /** Active styling for the current page. Default: `false`. */
  isSelected?: boolean
  /** Selected-state color — resolves against `theme.palette`. Default: 'primary', overridable via `theme.defaults.color`. */
  color?: PaginationItemColor
  /** `text` — no border · `outlined` — stroked. Default: `'text'`. */
  variant?: PaginationItemVariant
  /** Corner shape. Default: `'circular'`. */
  shape?: PaginationItemShape
  /** Item dimensions and font size — resolves against `theme.sizes`. Default: 'md', overridable via `theme.defaults.size`. */
  size?: PaginationItemSize
  disabled?: boolean
  as?: ElementType
}

/** Nav item type → registry icon. */
const NAV_ICONS: Record<'first' | 'previous' | 'next' | 'last', IconName> = {
  first: 'first_page',
  previous: 'chevron_left',
  next: 'chevron_right',
  last: 'last_page',
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'isSelected',
  'variant',
  'shape',
  'size',
])

interface ItemStyleProps {
  isSelected?: boolean
  color?: PaginationItemColor
  variant?: PaginationItemVariant
  shape?: PaginationItemShape
  size?: PaginationItemSize
}

// Square-ish dimensions per density token; fontSize follows theme.sizes.
// Partial on purpose: augmented theme sizes fall back to the md dimensions.
const ITEM_DIMENSIONS: Partial<Record<PaginationItemSize, string>> & Record<'md', string> = {
  sm: '1.75rem',
  md: '2rem',
  lg: '2.5rem',
}

const baseStyles = {
  appearance: 'none' as const,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  outline: 'none',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  fontFamily: 'inherit',
  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
}

const sizeStyles = ({
  theme,
  size = themeDefault(theme, 'size', 'md'),
}: ItemStyleProps & { theme: Theme }) => {
  return {
    minWidth: ITEM_DIMENSIONS[size] ?? ITEM_DIMENSIONS.md,
    height: ITEM_DIMENSIONS[size] ?? ITEM_DIMENSIONS.md,
    fontSize: theme.fontSizes[theme.sizes[size].fontSize],
  }
}

// circular → pill / rounded → the theme's grouped-control radius
const shapeStyles = ({
  theme,
  shape = themeDefault(theme, 'paginationShape', 'circular'),
}: ItemStyleProps & { theme: Theme }) =>
  shape === 'rounded'
    ? { borderRadius: theme.radii[themeDefault(theme, 'borderRadius', 'md')] }
    : { borderRadius: '9999px' }

const colorStyles = ({
  theme,
  variant: v = themeDefault(theme, 'paginationVariant', 'text'),
  color = themeDefault(theme, 'color', 'primary'),
  isSelected,
}: ItemStyleProps & { theme: Theme }) => {
  const c = theme.palette[color]
  if (isSelected) {
    return {
      backgroundColor: c.main,
      color: c.contrastText,
      border: `${theme.borderWidths.thin} solid ${v === 'outlined' ? c.main : 'transparent'}`,
      '&:hover:not(:disabled)': { backgroundColor: c.dark },
    }
  }
  return {
    color: get(theme, 'text.primary'),
    border: `${theme.borderWidths.thin} solid ${
      v === 'outlined' ? get(theme, 'border.light') : 'transparent'
    }`,
    '&:hover:not(:disabled)': { backgroundColor: alpha(c.main, 0.08) },
  }
}

const focusVisibleStyles = ({ theme }: { theme: Theme }) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
})

const ItemRoot = styled('button', {
  name: 'PaginationItem',
  label: 'PaginationItem',
  shouldForwardProp,
  systemProps: [space],
})<ItemStyleProps & SpaceProps<Theme>>(
  baseStyles,
  sizeStyles,
  shapeStyles,
  colorStyles,
  focusVisibleStyles
)

const Ellipsis = styled('span', {
  name: 'PaginationItem',
  slot: 'ellipsis',
  label: 'PaginationEllipsis',
  shouldForwardProp,
  systemProps: [space],
})<ItemStyleProps & SpaceProps<Theme>>(
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeStyles,
  ({ theme }: { theme: Theme }) => ({ color: get(theme, 'text.secondary') })
)

export function PaginationItem({
  type = 'page',
  page,
  isSelected = false,
  // undefined color/variant/shape/size resolve to theme.defaults in the styled layer.
  color,
  variant,
  shape,
  size,
  as,
  ...rest
}: Readonly<PaginationItemProps>) {
  if (type === 'start-ellipsis' || type === 'end-ellipsis') {
    const { disabled: _disabled, onClick: _onClick, ...ellipsisRest } = rest
    return (
      <Ellipsis as={as} size={size} {...ellipsisRest}>
        …
      </Ellipsis>
    )
  }

  return (
    <ItemRoot
      as={as}
      type={as === undefined ? 'button' : undefined}
      isSelected={isSelected}
      color={color}
      variant={variant}
      shape={shape}
      size={size}
      aria-current={isSelected ? 'page' : undefined}
      {...rest}
    >
      {type === 'page' ? page : <Icon name={NAV_ICONS[type]} size="1.25em" color="inherit" />}
    </ItemRoot>
  )
}
