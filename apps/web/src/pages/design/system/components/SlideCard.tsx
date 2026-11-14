import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Slide } from '@soroush.tech/design-system/Slide'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

export function SlideCard() {
  const [isShown, setIsShown] = useState(true)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="SLIDE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/slide/`} />}
      caption="Slides one child in from an edge of the window. Here an overflow-hidden frame clips it so it appears to enter from the card edge instead."
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
        <View overflow="hidden" width="100%">
          <Slide isShown={isShown} direction="right">
            <Paper elevation={0} bg="default" p={4}>
              <Typography variant="overline" color="primary" fontFamily="mono" display="block">
                SLIDE_TARGET
              </Typography>
            </Paper>
          </Slide>
        </View>
      </Flex>
    </Card>
  )
}
