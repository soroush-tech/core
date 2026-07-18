import type { Meta, StoryObj } from '@storybook/react-vite'
import { bg, p, m } from '@soroush.tech/design-system/utils/test/storiesArgs'
import { CodeBlock } from './CodeBlock'

const SAMPLE = `function greet(name) {
  return \`Hello, \${name}\`
}`

const meta: Meta<typeof CodeBlock> = {
  title: 'Theme/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['bg', 'p', 'm'] },
  },
  argTypes: { bg, p, m },
  render: (args) => (
    <CodeBlock {...args}>
      <code>{SAMPLE}</code>
    </CodeBlock>
  ),
}

export default meta
type Story = StoryObj<typeof CodeBlock>

export const Default: Story = {}
