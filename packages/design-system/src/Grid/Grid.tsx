import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  grid,
  flexbox,
  type GridProps as SystemGridProps,
  type FlexboxProps,
} from '../index'
import { View, type ViewProps } from '../View'

/** Valid values for the gap / columnGap / rowGap props — derived from theme.space keys. */
export type GapToken = keyof Theme['space']

// gap / columnGap / rowGap need no declaration or wiring here since
// @soroush.tech/styled-system 5.8.0 — they arrive through View's `space` parser
// and `SpaceProps`.
export interface GridProps extends ViewProps, SystemGridProps<Theme>, FlexboxProps<Theme> {}

const shouldForwardProp = createShouldForwardProp([...props])

export const Grid = styled(View, {
  name: 'Grid',
  label: 'grid',
  shouldForwardProp,
  systemProps: [grid, flexbox],
})<GridProps>({ display: 'grid' })
