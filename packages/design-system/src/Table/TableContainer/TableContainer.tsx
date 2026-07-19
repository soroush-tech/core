import { styled } from '@soroush.tech/design-system'
import { View, type ViewProps } from '@soroush.tech/design-system/View'

export type TableContainerProps = ViewProps

/**
 * Scroll wrapper for `Table` — wide tables scroll horizontally inside it
 * instead of breaking the page layout. Give it a bounded height to make
 * `Table`'s `hasStickyHeader` stick.
 */
export const TableContainer = styled(View, {
  name: 'TableContainer',
  label: 'TableContainer',
})<TableContainerProps>({
  overflowX: 'auto',
})
