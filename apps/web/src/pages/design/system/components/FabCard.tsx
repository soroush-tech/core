import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Fab } from '@soroush.tech/design-system/Fab'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { CardTitle } from './CardTitle'

export function FabCard() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="FAB" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/fab/`} />}
      caption="The one main action of a page: circular with an icon, or extended with a label. An extended fab collapses to a circle and keeps its name."
    >
      <Flex flexDirection="column" gap={4} alignItems="flex-start">
        <Flex flexDirection="row" gap={3} alignItems="center" flexWrap="wrap">
          <Fab aria-label="Add" size="sm">
            <Icon name="add" color="inherit" />
          </Fab>
          <Fab aria-label="Edit" color="secondary">
            <Icon name="edit_note" color="inherit" />
          </Fab>
          <Fab
            variant="extended"
            isCollapsed={isCollapsed}
            startIcon={<Icon name="add" color="inherit" />}
          >
            CREATE
          </Fab>
        </Flex>
        <Button
          variant="text"
          color="primary"
          size="sm"
          aria-pressed={isCollapsed}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? 'EXTEND_FAB' : 'COLLAPSE_FAB'}
        </Button>
      </Flex>
    </Card>
  )
}
