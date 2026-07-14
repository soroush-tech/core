import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  textColorTokens,
  textInputColorTokens,
  textInputSizeTokens,
  textInputVariantTokens,
} from '../../utils/test/storiesOptions'
import { Control } from '../Control'
import { Editor, type EditorProps } from './Editor'

const SAMPLE = '# New article\n\nStart writing in **Markdown** — Tab indents, no focus jump.\n'

// The Editor is controlled by Markdown context, so every story wraps it in a Control provider.
function EditorDemo(props: Readonly<EditorProps>) {
  const [value, setValue] = useState(SAMPLE)
  return (
    <Control value={value} onChange={setValue}>
      <Editor {...props} />
    </Control>
  )
}

const meta: Meta<typeof Editor> = {
  title: 'Theme/Markdown/Editor',
  component: Editor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'placeholder',
        'minRows',
        'variant',
        'color',
        'textColor',
        'size',
        'name',
        'id',
        'error',
        'required',
        'disabled',
        'showShortcutHint',
      ],
    },
  },
  args: { minRows: 8 },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Shown while the source is empty.',
      table: { category: 'Content' },
    },
    minRows: {
      control: 'number',
      description: 'Minimum visible rows of the auto-growing textarea.',
      table: { category: 'Layout', defaultValue: { summary: '16' } },
    },
    variant: {
      control: { type: 'select' },
      options: textInputVariantTokens,
      description: 'Visual style — forwarded to `TextInput`.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    color: {
      control: { type: 'select' },
      options: textInputColorTokens,
      description: 'Focus/active border colour — forwarded to `TextInput`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text colour of the typed source — forwarded to `TextInput`.',
      table: { category: 'Visual', defaultValue: { summary: 'initial' } },
    },
    size: {
      control: { type: 'select' },
      options: textInputSizeTokens,
      description: 'Padding/font-size density — forwarded to `TextInput`.',
      table: { category: 'Layout', defaultValue: { summary: 'md' } },
    },
    name: {
      control: 'text',
      description: 'Native textarea `name` for `<form>` / FormData submission.',
      table: { category: 'Behavior' },
    },
    id: {
      control: 'text',
      description: 'Label association — falls back to the enclosing `FormControl`.',
      table: { category: 'Behavior' },
    },
    error: {
      control: 'boolean',
      description: 'Marks the field invalid — falls back to the enclosing `FormControl`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field required — falls back to the enclosing `FormControl`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables editing — falls back to the enclosing `FormControl`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    showShortcutHint: {
      control: 'boolean',
      description: 'Shows the one-line Tab / focus-release shortcut hint under the field.',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
  },
  render: (args) => <EditorDemo {...args} />,
}

export default meta
type Story = StoryObj<typeof Editor>

export const Default: Story = {}

export const Outlined: Story = {
  args: { variant: 'outlined' },
}
