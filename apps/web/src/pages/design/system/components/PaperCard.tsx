import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const ELEVATIONS = [1, 3, 4, 5] as const

export function PaperCard() {
  return (
    <Card
      variant="bracketBox"
      bg="paper"
      p={5}
      width={['100%', '400px']}
      title={
        <CardTitle title="PAPER" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-paper--docs`} />
      }
      caption="Paper is an Surface components and shadow styles emulate physical surfaces and depth."
    >
      <Flex flexDirection="column" gap={3}>
        {ELEVATIONS.map((elevation) => (
          <Paper key={elevation} elevation={elevation} bg="default" px={3} py={1.5}>
            <Typography variant="caption" color="secondary" fontFamily="mono" opacity={0.5}>
              ELEVATION_{elevation}
            </Typography>
          </Paper>
        ))}
      </Flex>
    </Card>
  )
}
