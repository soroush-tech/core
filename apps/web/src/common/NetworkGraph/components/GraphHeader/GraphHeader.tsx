import type { ReactNode } from 'react'
import { styled } from '@soroush.tech/design-system'
import { Card } from '@soroush.tech/design-system/Card'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

export interface GraphHeaderProps {
  activeNode: string
  /** Title content rendered in the heading (caller-supplied so the graph stays generic). */
  heading: ReactNode
}

// clamp(), line-height:1, letter-spacing, text-transform can't be typed as styled-system props.
const Title = styled(Typography)`
  font-size: clamp(1.875rem, 4vw, 3rem);
  line-height: 1;
  letter-spacing: -0.04em;
  text-transform: uppercase;
`

export function GraphHeader({ activeNode, heading }: Readonly<GraphHeaderProps>) {
  return (
    <View position="absolute" top="2rem" left="2rem" zIndex={10} style={{ pointerEvents: 'none' }}>
      <Card variant="bracketBox" elevation={0} bg="transparent" p={2} mb={1}>
        <Title as="h1" fontWeight="bold" m={0} color="initial">
          {heading}
        </Title>
      </Card>
      <Typography
        fontSize={0}
        fontWeight="medium"
        letterSpacing="widest"
        textTransform="uppercase"
        mt={1}
        mb={0}
        color="secondary"
      >
        Active Node:{' '}
        <Typography as="span" color="primary">
          {activeNode}
        </Typography>
      </Typography>
    </View>
  )
}
