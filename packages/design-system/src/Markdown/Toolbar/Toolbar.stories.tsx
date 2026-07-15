import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flex } from '../../Flex'
import { Control } from '../Control'
import { Editor } from '../Editor'
import { Toolbar } from './Toolbar'

const SAMPLE = '# Title\n\nSelect some text, then use the toolbar.\n'

// The Toolbar dispatches through Markdown context, so it is shown inside a Control with an Editor.
function ToolbarDemo() {
  const [value, setValue] = useState(SAMPLE)
  return (
    <Control value={value} onChange={setValue}>
      <Flex flexDirection="column" gap={2}>
        <Toolbar />
        <Editor minRows={8} />
      </Flex>
    </Control>
  )
}

const meta: Meta<typeof Toolbar> = {
  title: 'Theme/Markdown/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: [] },
  },
  render: () => <ToolbarDemo />,
}

export default meta
type Story = StoryObj<typeof Toolbar>

export const Default: Story = {}
