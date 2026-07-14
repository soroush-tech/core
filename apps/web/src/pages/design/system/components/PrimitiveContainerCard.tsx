import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

const CONTAINERS = [
  { aspectRatio: '16/9', label: 'ASPECT: 16:9', token: 'TOKEN_SPACE_8' },
  { aspectRatio: '1', label: 'ASPECT: 1:1', token: 'TOKEN_SPACE_12' },
] as const

export function PrimitiveContainerCard() {
  return (
    <Card variant="bracketBox" bg="paper" p={5}>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start" mb={5}>
        <View>
          <Typography variant="caption" color="primary" display="block" mb={1} fontFamily="mono">
            PRIMITIVE_CONTAINER
          </Typography>
          <Typography variant="caption" color="secondary" letterSpacing="widest">
            Structural Layering &amp; Scale
          </Typography>
        </View>
        <Typography variant="caption" color="secondary" opacity={0.5} fontFamily="mono">
          POS: 0,0,1 / Z: 10
        </Typography>
      </Flex>

      <Flex flexDirection="row" gap={4}>
        {CONTAINERS.map(({ aspectRatio, label, token }) => (
          <Flex key={aspectRatio} flex="1">
            <Paper
              elevation={0}
              aspectRatio={aspectRatio}
              bg="default"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              <Typography variant="caption" color="secondary" opacity={0.5} fontFamily="mono">
                {label}
              </Typography>
            </Paper>
            <Flex flexDirection="row" justifyContent="space-between">
              <Typography variant="caption" color="secondary" fontFamily="mono">
                {token}
              </Typography>
              <Typography variant="caption" color="primary" fontFamily="mono">
                VALID
              </Typography>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}
