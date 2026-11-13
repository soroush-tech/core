import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { FabMenu, FabMenuItem } from '@soroush.tech/design-system/FabMenu'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const ACTIONS = [
  { label: 'NEW_NOTE', icon: 'edit_note' },
  { label: 'NEW_FOLDER', icon: 'folder' },
  { label: 'UPLOAD', icon: 'arrow_upward' },
] as const

export function FabMenuCard() {
  const [lastAction, setLastAction] = useState('NONE')

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="FAB_MENU" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/fab-menu/`} />
      }
      caption="A floating action button that opens a stack of actions. The menu has no built-in position, so here it sits in the card's flow and opens as a row beside the trigger."
    >
      <Flex flexDirection="column" gap={4} alignItems="flex-start">
        <FabMenu aria-label="Create" direction="right">
          {ACTIONS.map(({ label, icon }) => (
            <FabMenuItem
              key={label}
              icon={<Icon name={icon} color="inherit" size="sm" />}
              onClick={() => setLastAction(label)}
            >
              {label}
            </FabMenuItem>
          ))}
        </FabMenu>
        <Typography variant="caption" color="secondary" fontFamily="mono" letterSpacing="wide">
          LAST_ACTION: {lastAction}
        </Typography>
      </Flex>
    </Card>
  )
}
