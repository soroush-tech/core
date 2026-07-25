import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LiveEdit, type LiveEditProps } from './LiveEdit'

const SAMPLE = [
  '# Live editing',
  '',
  'Type directly on the rendered document — **bold**, _italic_,',
  '`code`, and [links](https://example.com) render exactly like `Preview`.',
  '',
  '- Every block is contentEditable; edits serialize back to markdown live',
  '- Blur or press Escape to finish a block; untouched blocks keep their exact source',
  '',
  '```ts',
  'const lossless = true',
  '```',
].join('\n')

/** Controlled wrapper so story edits persist like in a real consumer. */
function LiveEditPlayground({ value: initial = '', ...rest }: Readonly<LiveEditProps>) {
  const [value, setValue] = useState(initial)
  return <LiveEdit {...rest} value={value} onChange={setValue} />
}

const meta: Meta<typeof LiveEdit> = {
  title: 'Theme/Markdown/LiveEdit',
  component: LiveEdit,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['value', 'placeholder', 'slotProps'] },
  },
  args: {
    value: SAMPLE,
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Markdown source (standalone mode; ignored inside a `Control`).',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Shown as a clickable block while the document is empty.',
      table: { category: 'Content' },
    },
    slotProps: {
      control: 'object',
      description: 'Per-element prop overrides forwarded to every block preview.',
      table: { category: 'Behavior' },
    },
  },
  render: (args) => <LiveEditPlayground {...args} />,
}

export default meta
type Story = StoryObj<typeof LiveEdit>

export const Default: Story = {}

// An empty document renders the placeholder block; clicking it starts writing.
export const Empty: Story = {
  args: { value: '', placeholder: 'Click to start writing…' },
}

// `slotProps` overrides flow into every block's preview.
export const WithOverrides: Story = {
  args: {
    slotProps: { p: { color: 'primary' }, a: { underline: 'always' } },
  },
}
