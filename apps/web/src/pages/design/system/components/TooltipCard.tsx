import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Tooltip } from '@soroush.tech/design-system/Tooltip'
import { CardTitle } from './CardTitle'

const PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const

export function TooltipCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="TOOLTIP" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/tooltip/`} />
      }
      caption="A short description shown on hover, keyboard focus and a long touch, placed beside its child and flipped for want of room. Escape closes it; it never takes focus."
    >
      <Flex flexDirection="row" flexWrap="wrap" gap={3}>
        {PLACEMENTS.map((placement) => (
          <Tooltip
            key={placement}
            title={`Placed ${placement}`}
            placement={placement}
            hasArrow
            shouldDescribeChild
          >
            <Button variant="outlined" color="primary" size="sm">
              {placement.toUpperCase()}
            </Button>
          </Tooltip>
        ))}
      </Flex>
    </Card>
  )
}
