import { styled } from 'src/theme'
import { View, type ViewProps } from 'src/theme/View'

export type TableContainerProps = ViewProps

/**
 * Scroll wrapper for `Table` — wide tables scroll horizontally inside it
 * instead of breaking the page layout. Give it a bounded height to make
 * `Table`'s `hasStickyHeader` stick.
 */
export const TableContainer = styled(View, { label: 'TableContainer' })<TableContainerProps>({
  overflowX: 'auto',
})
