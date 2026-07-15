import { useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Drawer, type DrawerAnchor } from '@soroush.tech/design-system/Drawer'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const ANCHORS: DrawerAnchor[] = ['left', 'right', 'top', 'bottom']

export function DrawerCard() {
  const [anchor, setAnchor] = useState<DrawerAnchor | null>(null)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="DRAWER"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-drawer--docs`}
        />
      }
      caption="A temporary panel that slides in from a screen edge, built on Modal — portal, backdrop, focus trap, scroll lock, and Escape/backdrop-click close are inherited."
    >
      <Flex flexDirection="row" gap={2} flexWrap="wrap">
        {ANCHORS.map((edge) => (
          <Button
            key={edge}
            variant="outlined"
            color="primary"
            size="sm"
            onClick={() => setAnchor(edge)}
          >
            {edge.toUpperCase()}
          </Button>
        ))}
      </Flex>
      <Drawer isOpen={anchor !== null} onClose={() => setAnchor(null)} anchor={anchor ?? 'left'}>
        <View p={5} minWidth="240px">
          <Typography variant="overline" color="primary" fontFamily="mono" display="block" mb={2}>
            DRAWER_{(anchor ?? 'left').toUpperCase()}
          </Typography>
          <Typography variant="caption" color="secondary" fontFamily="mono">
            Press Escape or click the backdrop to close.
          </Typography>
        </View>
      </Drawer>
    </Card>
  )
}
