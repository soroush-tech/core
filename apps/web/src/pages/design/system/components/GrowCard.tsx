import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Grow } from '@soroush.tech/design-system/Grow'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function GrowCard() {
  const [isShown, setIsShown] = useState(true)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="GROW" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/grow/`} />}
      caption="Grows one child in from slightly smaller while it fades, then shrinks it back out. It suits popovers and menus that open from a trigger."
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
        <Grow isShown={isShown}>
          <Paper elevation={0} bg="default" p={4}>
            <Typography variant="overline" color="primary" fontFamily="mono" display="block">
              GROW_TARGET
            </Typography>
          </Paper>
        </Grow>
      </Flex>
    </Card>
  )
}
