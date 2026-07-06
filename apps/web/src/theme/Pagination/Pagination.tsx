import { type HTMLAttributes } from 'react'
import {
  usePagination,
  type PaginationItemType,
  type UsePaginationProps,
} from './hooks/usePagination'
import {
  PaginationItem,
  type PaginationItemColor,
  type PaginationItemShape,
  type PaginationItemSize,
  type PaginationItemVariant,
} from './PaginationItem'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  type SpaceProps,
} from 'src/theme'

export type PaginationColor = PaginationItemColor
export type PaginationVariant = PaginationItemVariant
export type PaginationShape = PaginationItemShape
export type PaginationSize = PaginationItemSize

export interface PaginationProps
  extends
    Omit<HTMLAttributes<HTMLElement>, 'color' | 'onChange'>,
    UsePaginationProps,
    SpaceProps<Theme> {
  /** Selected-item color — resolves against `theme.palette`. Default: `'primary'`. */
  color?: PaginationColor
  /** Item style — `text` or `outlined`. Default: `'text'`. */
  variant?: PaginationVariant
  /** Item corner shape. Default: `'circular'`. */
  shape?: PaginationShape
  /** Item density — resolves against `theme.sizes`. Default: `'md'`. */
  size?: PaginationSize
  /** Accessible name per item — important for screen readers. A sensible default is provided. */
  getItemAriaLabel?: (type: PaginationItemType, page: number | null, isSelected: boolean) => string
}

const defaultGetItemAriaLabel = (
  type: PaginationItemType,
  page: number | null,
  isSelected: boolean
) => {
  if (type === 'page') return isSelected ? `page ${page}` : `Go to page ${page}`
  return `Go to ${type} page`
}

const shouldForwardProp = createShouldForwardProp([...props])

const PaginationList = styled('ul', {
  label: 'Pagination',
  shouldForwardProp,
})<SpaceProps<Theme>>(
  {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  space
)

export function Pagination({
  count,
  page,
  defaultPage,
  siblingCount,
  boundaryCount,
  disabled,
  shouldShowFirstButton,
  shouldShowLastButton,
  shouldHidePrevButton,
  shouldHideNextButton,
  onChange,
  color = 'primary',
  variant = 'text',
  shape = 'circular',
  size = 'md',
  getItemAriaLabel = defaultGetItemAriaLabel,
  'aria-label': ariaLabel = 'pagination navigation',
  ...rest
}: Readonly<PaginationProps>) {
  const { items } = usePagination({
    count,
    page,
    defaultPage,
    siblingCount,
    boundaryCount,
    disabled,
    shouldShowFirstButton,
    shouldShowLastButton,
    shouldHidePrevButton,
    shouldHideNextButton,
    onChange,
  })

  return (
    <nav aria-label={ariaLabel} {...rest}>
      <PaginationList>
        {items.map((item, index) => {
          const isEllipsis = item.type === 'start-ellipsis' || item.type === 'end-ellipsis'
          return (
            <li key={`${item.type}-${item.page ?? index}`} aria-hidden={isEllipsis || undefined}>
              <PaginationItem
                type={item.type}
                page={item.page}
                isSelected={item.isSelected}
                disabled={item.isDisabled}
                onClick={item.onClick}
                color={color}
                variant={variant}
                shape={shape}
                size={size}
                aria-label={
                  isEllipsis ? undefined : getItemAriaLabel(item.type, item.page, item.isSelected)
                }
              />
            </li>
          )
        })}
      </PaginationList>
    </nav>
  )
}
