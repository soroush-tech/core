import { useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Popover } from '@soroush.tech/design-system/Popover'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

export function PopoverCard() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="POPOVER"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-popover--docs`}
        />
      }
      caption="Anchors floating content to an element, portaled above the page. Built on Modal, so backdrop, focus management, and Escape/click-away close come for free."
    >
      <Flex flexDirection="row">
        <Button
          variant="outlined"
          color="primary"
          size="sm"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          OPEN_POPOVER
        </Button>
      </Flex>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <View p={4} maxWidth="280px">
          <Typography variant="overline" color="primary" fontFamily="mono" display="block" mb={1}>
            ANCHORED_SURFACE
          </Typography>
          <Typography variant="caption" color="secondary" fontFamily="mono">
            Positioned under the trigger via anchorOrigin. Escape or click away to close.
          </Typography>
        </View>
      </Popover>
    </Card>
  )
}
