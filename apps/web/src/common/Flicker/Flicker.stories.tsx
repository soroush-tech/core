import type { Meta, StoryObj } from '@storybook/react-vite'
import { gap, m, p } from '@soroush.tech/design-system/utils/test/storiesArgs'
import {
  flexAlignItemsTokens,
  flexJustifyContentTokens,
} from '@soroush.tech/design-system/utils/test/storiesOptions'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Flicker } from './Flicker'

const meta = {
  title: 'Common/Flicker',
  component: Flicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Extends [`Flex`](../Flex). Wraps its children in a looping opacity flicker — a short ' +
          'blink burst then a steady hold each cycle (`2s`). Used to frame unstable / warning glyphs.',
      },
    },
    controls: {
      include: ['children', 'alignItems', 'justifyContent', 'gap', 'p', 'm'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Content framed by the flicker animation.',
      table: { category: 'Content' },
    },
    alignItems: {
      control: { type: 'select' },
      options: flexAlignItemsTokens,
      description: 'CSS align-items (inherited from Flex).',
      table: { category: 'Layout' },
    },
    justifyContent: {
      control: { type: 'select' },
      options: flexJustifyContentTokens,
      description: 'CSS justify-content (inherited from Flex).',
      table: { category: 'Layout' },
    },
    gap,
    p,
    m,
  },
} satisfies Meta<typeof Flicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    alignItems: 'center',
    children: 'SIGNAL LOST',
  },
}

export const WithIcon: Story = {
  render: () => (
    <Flicker alignItems="center">
      <Icon name="warning" color="error" size="3.75rem" />
    </Flicker>
  ),
}
