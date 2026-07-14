import { useContext, type ButtonHTMLAttributes } from 'react'
import { TableContext } from '../TableContext'
import { Icon, type IconName, type IconProps } from '../../Icon'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  get,
  type SpaceProps,
} from '../../index'

export type TableSortLabelDirection = 'asc' | 'desc'

export interface TableSortLabelProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, SpaceProps<Theme> {
  /** Marks the currently-sorted column — shows the icon fully opaque. Default: `false`. */
  isActive?: boolean
  /** Current sort direction — rotates the arrow. Default: `'asc'`. */
  direction?: TableSortLabelDirection
  /**
   * Hides the inactive sort icon, revealing it on hover/focus. Set `false` to
   * keep it always visible (dimmed while inactive). Inherited from the
   * enclosing `Table`'s `shouldHideSortIcon` via `TableContext`. Default: `true`.
   */
  shouldHideSortIcon?: boolean
  /** Sort arrow icon. Default: `'arrow_upward'`. */
  iconName?: IconName
  /** Extra props for the sort arrow icon. */
  iconProps?: Omit<IconProps, 'name'>
}

const shouldForwardProp = createShouldForwardProp([...props, 'isActive', 'shouldHideSortIcon'])

// A lean inline button that inherits the cell's typography and color — the
// active column keeps the header's color; the icon alone signals sort state.
const SortLabelRoot = styled('button', {
  label: 'TableSortLabel',
  shouldForwardProp,
})<{ isActive?: boolean; shouldHideSortIcon?: boolean } & SpaceProps<Theme>>(
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
  },
  ({ theme }) => ({
    '&:focus-visible': {
      outline: `2px solid ${get(theme, 'palette.primary.main')}`,
      outlineOffset: '2px',
    },
  }),
  // When the inactive icon is hidden, hover/focus reveals it (dimmed); the
  // active icon stays fully opaque and needs no reveal.
  ({ isActive, shouldHideSortIcon }) =>
    !isActive && shouldHideSortIcon
      ? { '&:hover .sort-icon, &:focus-visible .sort-icon': { opacity: 0.5 } }
      : {},
  space
)

// `isDescending`, not `direction` — SVG elements have a native `direction`
// attribute that clashes with a custom string prop of the same name.
const shouldForwardIconProp = (prop: string) =>
  prop !== 'isDescending' && prop !== 'isActive' && prop !== 'shouldHideSortIcon'

const SortIcon = styled(Icon, { shouldForwardProp: shouldForwardIconProp })<{
  isDescending: boolean
  isActive: boolean
  shouldHideSortIcon: boolean
}>(
  {
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  ({ isDescending }) => ({
    transform: isDescending ? 'rotate(180deg)' : 'none',
  }),
  // Active → fully opaque · inactive + hidden → invisible (hover reveals) ·
  // inactive + visible → dimmed.
  ({ isActive, shouldHideSortIcon }) => {
    const inactiveOpacity = shouldHideSortIcon ? 0 : 0.5
    return { opacity: isActive ? 1 : inactiveOpacity }
  }
)

export function TableSortLabel({
  isActive = false,
  direction = 'asc',
  shouldHideSortIcon,
  iconName = 'arrow_upward',
  iconProps,
  type = 'button',
  children,
  ...rest
}: Readonly<TableSortLabelProps>) {
  // Resolution: explicit prop → enclosing Table's context → default (hidden).
  const table = useContext(TableContext)
  const resolvedHideSortIcon = shouldHideSortIcon ?? table.shouldHideSortIcon ?? true

  return (
    <SortLabelRoot
      isActive={isActive}
      shouldHideSortIcon={resolvedHideSortIcon}
      type={type}
      {...rest}
    >
      {children}
      <SortIcon
        name={iconName}
        size="1em"
        color="inherit"
        isDescending={direction === 'desc'}
        isActive={isActive}
        shouldHideSortIcon={resolvedHideSortIcon}
        {...iconProps}
        className="sort-icon"
      />
    </SortLabelRoot>
  )
}
