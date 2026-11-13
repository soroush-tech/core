import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Sidebar, SidebarItem } from '@soroush.tech/design-system/Sidebar'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'
import type { IconName } from '@soroush.tech/design-system/Icon'

const ITEMS: { id: string; icon: IconName; label: string; description: string }[] = [
  { id: 'home', icon: 'home', label: 'HOME', description: 'Overview of the workspace.' },
  { id: 'folder', icon: 'folder', label: 'DIRECTORY', description: 'Files in the open project.' },
  {
    id: 'terminal',
    icon: 'terminal',
    label: 'TERMINAL',
    description: 'A shell in the project root.',
  },
  {
    id: 'analytics',
    icon: 'analytics',
    label: 'ANALYTICS',
    description: 'Build and test metrics.',
  },
]

export function SidebarCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(ITEMS[0])

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="SIDEBAR" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/sidebar/`} />
      }
      caption="A collapsible icon rail rendered as a nav landmark. Open state is controlled - the toggle lives outside the rail - and items read it through context."
    >
      <Flex
        bg="default"
        borderRadius="md"
        borderWidth="thin"
        borderStyle="solid"
        borderColor="light"
        overflow="hidden"
      >
        <Flex
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          bg="terminal"
          px={3}
          py={2}
        >
          <Typography variant="caption" color="primary" fontFamily="mono" letterSpacing="wide">
            WORKSPACE
          </Typography>
          <Button
            variant="text"
            color="primary"
            size="sm"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'COLLAPSE_RAIL' : 'EXPAND_RAIL'}
          </Button>
        </Flex>
        <Flex flexDirection="row">
          <Sidebar aria-label="Showcase rail" isOpen={isOpen} bg="terminal" py={2}>
            {ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isSelected={selected.id === item.id}
                onSelect={() => setSelected(item)}
              />
            ))}
          </Sidebar>
          <Flex flex="1" p={4} gap={2}>
            <Typography variant="overline" color="secondary" fontFamily="mono" opacity={0.5}>
              ACTIVE_PANEL
            </Typography>
            <Typography variant="caption" color="primary" fontFamily="mono" letterSpacing="wide">
              {selected.label}
            </Typography>
            <Typography variant="caption" color="secondary" fontFamily="mono">
              {selected.description}
            </Typography>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
