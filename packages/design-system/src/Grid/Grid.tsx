import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  grid,
  flexbox,
  system,
  type GridProps as SystemGridProps,
  type FlexboxProps,
  type ResponsiveValue,
} from '../index'
import { View, type ViewProps } from '../View'

/** Valid values for the gap / columnGap / rowGap props — derived from theme.space keys. */
export type GapToken = keyof Theme['space']

export interface GridProps extends ViewProps, SystemGridProps<Theme>, FlexboxProps<Theme> {
  /** Resolves against theme.space — maps to CSS gap. Accepts responsive arrays. */
  gap?: ResponsiveValue<GapToken>
  /** Resolves against theme.space — maps to CSS column-gap. Accepts responsive arrays. */
  columnGap?: ResponsiveValue<GapToken>
  /** Resolves against theme.space — maps to CSS row-gap. Accepts responsive arrays. */
  rowGap?: ResponsiveValue<GapToken>
}

// gap / columnGap / rowGap are not in the default styled-system props list —
// must be added explicitly to prevent them reaching the DOM as HTML attributes.
const shouldForwardProp = createShouldForwardProp([...props, 'gap', 'columnGap', 'rowGap'])

const gapSystem = system({
  gap: { property: 'gap', scale: 'space' },
  columnGap: { property: 'columnGap', scale: 'space' },
  rowGap: { property: 'rowGap', scale: 'space' },
})

export const Grid = styled(View, { label: 'grid', shouldForwardProp })<GridProps>(
  { display: 'grid' },
  gapSystem,
  grid,
  flexbox
)
