import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Badge } from '@soroush.tech/design-system/Badge'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const BADGES = [
  { label: 'COUNT', icon: 'inventory_2', badgeContent: 4, badgeLabel: '4 new items' },
  { label: 'MAX', icon: 'history', badgeContent: 120, badgeLabel: '120 new events' },
  {
    label: 'ZERO',
    icon: 'checklist',
    badgeContent: 0,
    badgeLabel: 'No open tasks',
    shouldShowZero: true,
    color: 'success',
  },
  {
    label: 'DOT',
    icon: 'cloud_done',
    variant: 'dot',
    badgeLabel: 'Sync pending',
    color: 'primary',
  },
] as const

export function BadgeCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="BADGE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/badge/`} />}
      caption="A count or a dot anchored to the corner of another element. Counts past max read as max+, and badgeLabel is what a screen reader hears instead of the bare number."
    >
      <Flex flexDirection="row" gap={6} flexWrap="wrap">
        {BADGES.map(({ label, icon, ...badge }) => (
          <View key={label} textAlign="center">
            <Badge {...badge} mb={2}>
              <Icon name={icon} color="secondary" />
            </Badge>
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              fontFamily="mono"
            >
              {label}
            </Typography>
          </View>
        ))}
      </Flex>
    </Card>
  )
}
