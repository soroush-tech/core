import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { ContextMenu, Menu, MenuDivider } from '@soroush.tech/design-system/Menu'
import { MenuItem } from '@soroush.tech/design-system/MenuItem'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function MenuCard() {
  const [lastCommand, setLastCommand] = useState<string | number>('NONE')

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="MENU" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/menu/`} />}
      caption="A trigger and the list of commands it opens, without trapping focus. ContextMenu opens the same list at the pointer on a right-click, or on Shift+F10."
    >
      <Flex flexDirection={['column', 'row']} gap={4} alignItems={['stretch', 'center']}>
        <Menu
          trigger={
            <Button variant="outlined" color="primary" size="sm">
              OPEN_MENU
            </Button>
          }
          onSelect={setLastCommand}
        >
          <MenuItem value="DEPLOY">Deploy</MenuItem>
          <MenuItem value="ROLLBACK">Roll back</MenuItem>
          <MenuDivider />
          <MenuItem value="ARCHIVE" disabled>
            Archive
          </MenuItem>
        </Menu>
        <ContextMenu
          aria-label="Canvas actions"
          onSelect={setLastCommand}
          target={
            <Flex
              tabIndex={0}
              flex="1"
              p={3}
              borderWidth="thin"
              borderStyle="dashed"
              borderColor="light"
              borderRadius="md"
            >
              <Typography variant="caption" color="secondary" fontFamily="mono">
                RIGHT_CLICK_HERE
              </Typography>
            </Flex>
          }
        >
          <MenuItem value="COPY">Copy</MenuItem>
          <MenuItem value="PASTE">Paste</MenuItem>
        </ContextMenu>
      </Flex>
      <Typography variant="caption" color="secondary" fontFamily="mono" display="block" mt={3}>
        LAST_COMMAND: {lastCommand}
      </Typography>
    </Card>
  )
}
