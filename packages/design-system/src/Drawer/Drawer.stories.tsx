import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { anchorTokens } from '../utils/test/storiesOptions'
import { Button } from '../Button'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { Drawer } from './Drawer'

const meta: Meta<typeof Drawer> = {
  title: 'Theme/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: ['anchor', 'elevation', 'hasBackdrop', 'transitionDuration'],
    },
  },
  argTypes: {
    anchor: {
      control: { type: 'inline-radio' },
      options: anchorTokens,
      description: 'Edge the drawer slides in from.',
      table: { category: 'Layout', defaultValue: { summary: 'left' } },
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Shadow depth of the panel (0–24), forwarded to Paper.',
      table: { category: 'Visual', defaultValue: { summary: '16' } },
    },
    hasBackdrop: {
      control: 'boolean',
      description: 'Render the dimmed backdrop behind the panel.',
      table: { category: 'Visual', defaultValue: { summary: 'true' } },
    },
    transitionDuration: {
      control: { type: 'number' },
      description: 'Slide duration in milliseconds.',
      table: { category: 'Visual', defaultValue: { summary: '225' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Drawer>
type DrawerArgs = Partial<ComponentProps<typeof Drawer>>

const DrawerDemo = (args: DrawerArgs) => {
  const [isOpen, setIsOpen] = useState(false)
  const isHorizontal = args.anchor === 'top' || args.anchor === 'bottom'
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open drawer</Button>
      <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Flex flexDirection="column" gap={3} p={4} width={isHorizontal ? '100%' : '260px'}>
          <Typography variant="h6" m={0}>
            Drawer
          </Typography>
          <Typography variant="body2" color="secondary" m={0}>
            Slides in from the “{args.anchor}” edge. Press Escape or click the backdrop to close.
          </Typography>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </Flex>
      </Drawer>
    </>
  )
}

export const Default: Story = {
  args: {
    anchor: 'left',
    elevation: 16,
    hasBackdrop: true,
    transitionDuration: 225,
  },
  render: (args) => <DrawerDemo {...args} />,
}
