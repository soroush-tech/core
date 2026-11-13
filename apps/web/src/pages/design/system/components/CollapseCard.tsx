import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Collapse } from '@soroush.tech/design-system/Collapse'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Paper } from '@soroush.tech/design-system/Paper'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function CollapseCard() {
  const [isShown, setIsShown] = useState(true)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="COLLAPSE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/collapse/`} />
      }
      caption="Opens and closes its content by its height, measured as it starts, so content that grows keeps showing. Closed with no collapsedSize, it is hidden from the tab order."
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
        <Collapse isShown={isShown}>
          <Paper elevation={0} bg="default" p={4}>
            <Typography variant="overline" color="primary" fontFamily="mono" display="block">
              COLLAPSE_TARGET
            </Typography>
          </Paper>
        </Collapse>
      </Flex>
    </Card>
  )
}
