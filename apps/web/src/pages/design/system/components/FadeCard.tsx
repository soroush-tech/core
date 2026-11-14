import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Fade } from '@soroush.tech/design-system/Fade'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function FadeCard() {
  const [isShown, setIsShown] = useState(true)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="FADE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/fade/`} />}
      caption="Fades one child in and out by its opacity, timed by theme.transitions. Out, the child is hidden, so it takes no click or focus."
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
        <Fade isShown={isShown}>
          <Paper elevation={0} bg="default" p={4}>
            <Typography variant="overline" color="primary" fontFamily="mono" display="block">
              FADE_TARGET
            </Typography>
          </Paper>
        </Fade>
      </Flex>
    </Card>
  )
}
