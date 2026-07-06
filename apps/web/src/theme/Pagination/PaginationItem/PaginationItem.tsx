import { type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react'
import { Icon, type IconName } from 'src/theme/Icon'
import { type PaginationItemType } from 'src/theme/Pagination/hooks/usePagination'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  variant,
  get,
  type SpaceProps,
} from 'src/theme'
import { alpha } from 'src/theme/utils'

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
  /** Selected-state color — resolves against `theme.palette`. Default: `'primary'`. */
  color?: PaginationItemColor
  /** `text` — no border · `outlined` — stroked. Default: `'text'`. */
  variant?: PaginationItemVariant
  /** Corner shape. Default: `'circular'`. */
  shape?: PaginationItemShape
  /** Item dimensions and font size — resolves against `theme.sizes`. Default: `'md'`. */
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
const ITEM_DIMENSIONS: Record<PaginationItemSize, string> = {
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

const sizeStyles = ({ theme, size = 'md' }: ItemStyleProps & { theme: Theme }) => ({
  minWidth: ITEM_DIMENSIONS[size],
  height: ITEM_DIMENSIONS[size],
  fontSize: theme.fontSizes[theme.sizes[size].fontSize],
})

const shapeStyles = variant({
  prop: 'shape',
  variants: {
    circular: { borderRadius: '9999px' },
    rounded: { borderRadius: 'md' },
  },
})

const colorStyles = ({
  theme,
  variant: v = 'text',
  color = 'primary',
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
  label: 'PaginationItem',
  shouldForwardProp,
})<ItemStyleProps & SpaceProps<Theme>>(
  baseStyles,
  sizeStyles,
  shapeStyles,
  colorStyles,
  focusVisibleStyles,
  space
)

const Ellipsis = styled('span', {
  label: 'PaginationEllipsis',
  shouldForwardProp,
})<ItemStyleProps & SpaceProps<Theme>>(
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeStyles,
  ({ theme }: { theme: Theme }) => ({ color: get(theme, 'text.secondary') }),
  space
)

export function PaginationItem({
  type = 'page',
  page,
  isSelected = false,
  color = 'primary',
  variant = 'text',
  shape = 'circular',
  size = 'md',
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
