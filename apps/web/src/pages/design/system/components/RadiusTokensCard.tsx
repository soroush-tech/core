import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

const RADII = [
  { borderRadius: 'sq' as const, name: 'DEFAULT', sub: 'SQ' },
  { borderRadius: '6px' as const, name: 'CUSTOM', sub: 'LEGACY_INTERACTION' },
  { borderRadius: '9999px' as const, name: 'ROUND', sub: 'AVATAR' },
]

const RADII_SIZE = [
  { borderRadius: 'sm' as const, name: 'SMALL', sub: 'SM' },
  { borderRadius: 'md' as const, name: 'MEDIUM', sub: 'MD' },
  { borderRadius: 'lg' as const, name: 'LARGE', sub: 'LG' },
]

export function RadiusTokensCard() {
  return (
    <Card
      variant="bracketBox"
      bg="paper"
      p={5}
      width={['100%', '560px']}
      title="RADIUS_TOKENS"
      titleProps={{ mb: 4 }}
    >
      <Flex flexDirection="row" gap={4}>
        <Flex flexDirection="column" gap={4}>
          {RADII_SIZE.map(({ borderRadius, name, sub }) => (
            <Flex key={name} flexDirection="row" alignItems="center" gap={3}>
              <Paper
                aspectRatio="1"
                width="48px"
                height="48px"
                bg="default"
                borderWidth="thin"
                borderStyle="solid"
                borderColor="primary"
                borderRadius={borderRadius}
              />
              <View>
                <Typography variant="caption" color="initial" display="block" fontFamily="mono">
                  {name}
                </Typography>
                <Typography variant="caption" color="secondary" opacity={0.5} fontFamily="mono">
                  {sub}
                </Typography>
              </View>
            </Flex>
          ))}
        </Flex>{' '}
        <Flex flexDirection="column" gap={4}>
          {RADII.map(({ borderRadius, name, sub }) => (
            <Flex key={name} flexDirection="row" alignItems="center" gap={3}>
              <Paper
                aspectRatio="1"
                width="48px"
                height="48px"
                bg="default"
                borderWidth="thin"
                borderStyle="solid"
                borderColor="primary"
                borderRadius={borderRadius}
              />
              <View>
                <Typography variant="caption" color="initial" display="block" fontFamily="mono">
                  {name}
                </Typography>
                <Typography variant="caption" color="secondary" opacity={0.5} fontFamily="mono">
                  {sub}
                </Typography>
              </View>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
