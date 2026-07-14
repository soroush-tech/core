import styled from '@emotion/styled'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { alpha } from '@soroush.tech/design-system/utils'

const Divider = styled(View, { label: 'Divider' })`
  height: 1px;
  flex: 1;
  background-color: ${({ theme }) => alpha(theme.border.primary, 0.3)};
`

export interface HeadlineProps {
  title: string
}

export function Headline({ title }: Readonly<HeadlineProps>) {
  return (
    <Flex flexDirection="row" alignItems="center" gap={3} mb={5}>
      <Typography variant="h3" as="h2" letterSpacing="tighter" color="initial">
        {title}
      </Typography>
      <Divider />
    </Flex>
  )
}
