import { type ElementType } from 'react'
import { styled } from '@soroush.tech/design-system'
import { Grid, type GridProps } from '@soroush.tech/design-system/Grid'
import { View } from '@soroush.tech/design-system/View'

// grid-column: 1 / -1 spans every column whatever the count - View has no gridColumn prop
const FrameContent = styled(View, { label: 'LayoutFrame' })`
  grid-column: 1 / -1;
`

export interface LayoutFrameProps extends GridProps {
  /** Overrides of the theme's layout grid, as on `Grid`. Default: the theme's own. */
  layout?: GridProps['layout']
  as?: ElementType
}

/**
 * @description The page frame from `theme.layout` - its margins and max width - around
 * content that isn't laid out in columns. Props go to the outer layout grid.
 */
export function LayoutFrame({ layout = true, children, ...props }: Readonly<LayoutFrameProps>) {
  return (
    <Grid layout={layout} {...props}>
      <FrameContent>{children}</FrameContent>
    </Grid>
  )
}
