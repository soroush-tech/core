import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Zoom } from '@soroush.tech/design-system/Zoom'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function ZoomCard() {
  const [isShown, setIsShown] = useState(true)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="ZOOM" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/zoom/`} />}
      caption="Zooms one child in from nothing and back out. Users who prefer reduced motion see the change at once, and the callbacks still fire."
    >
      <Flex flexDirection="column" gap={4} alignItems="flex-start">
        <Button
          variant="outlined"
          color="primary"
          size="sm"
          onClick={() => setIsShown((shown) => !shown)}
        >
          {isShown ? 'HIDE' : 'SHOW'}
        </Button>
        <Zoom isShown={isShown}>
          <Paper elevation={0} bg="default" p={4}>
            <Typography variant="overline" color="primary" fontFamily="mono" display="block">
              ZOOM_TARGET
            </Typography>
          </Paper>
        </Zoom>
      </Flex>
    </Card>
  )
}
