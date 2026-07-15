import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button'
import { Paper } from '../Paper'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { TextInput } from '../TextInput'
import { FocusTrap } from './FocusTrap'

const meta: Meta<typeof FocusTrap> = {
  title: 'Theme/FocusTrap',
  component: FocusTrap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'isEnabled',
        'shouldAutoFocus',
        'shouldTrapFocus',
        'shouldEnforceFocus',
        'shouldRestoreFocus',
      ],
    },
  },
  argTypes: {
    isEnabled: {
      control: 'boolean',
      description: 'When false, focus is neither moved nor trapped.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    shouldAutoFocus: {
      control: 'boolean',
      description: 'Move focus into the trap when it activates.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldTrapFocus: {
      control: 'boolean',
      description: 'Keep Tab / Shift+Tab cycling within the trap.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldEnforceFocus: {
      control: 'boolean',
      description: 'Pull focus back inside whenever it escapes the trap.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldRestoreFocus: {
      control: 'boolean',
      description: 'Restore focus to the previously focused element when the trap deactivates.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof FocusTrap>

export const Default: Story = {
  args: {
    isEnabled: true,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
  },
  render: (args) => (
    <Flex flexDirection="column" gap={3} alignItems="flex-start">
      {/* Outside the trap: try to Tab or click here — with shouldEnforceFocus on,
          focus is pulled straight back inside the panel. */}
      <TextInput inputProps={{ placeholder: 'Outside the trap' }} />
      <FocusTrap {...args}>
        <Paper p={4} width="320px">
          <Flex flexDirection="column" gap={3}>
            <Typography variant="h5" m={0}>
              Focus trap
            </Typography>
            <Typography variant="body2" color="secondary" m={0}>
              Tab and Shift+Tab cycle through these fields without leaving the panel.
            </Typography>
            <TextInput fullWidth inputProps={{ placeholder: 'First name' }} />
            <TextInput fullWidth inputProps={{ placeholder: 'Last name' }} />
            <TextInput fullWidth inputProps={{ type: 'email', placeholder: 'Email' }} />
            <Button>Submit</Button>
          </Flex>
        </Paper>
      </FocusTrap>
    </Flex>
  ),
}
