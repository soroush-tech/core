import type { Meta, StoryObj } from '@storybook/react-vite'
import { p, m } from '../utils/test/storiesArgs'
import { formSizeTokens, formColorTokens, textColorTokens } from '../utils/test/storiesOptions'
import { FormLabel } from '../FormLabel'
import { FormHelperText } from '../FormHelperText'
import { TextInput } from '../TextInput'
import { Flex } from '../Flex'
import { FormControl } from './FormControl'

const meta: Meta<typeof FormControl> = {
  title: 'Theme/FormControl',
  component: FormControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'error',
        'disabled',
        'required',
        'size',
        'fullWidth',
        'color',
        'textColor',
        'p',
        'm',
      ],
    },
  },
  argTypes: {
    error: {
      control: 'boolean',
      description: 'Marks the field invalid — trickles to the control and helper text.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the field — trickles to the control.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field required — trickles to the label indicator and control.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    size: {
      control: { type: 'select' },
      options: formSizeTokens,
      description: 'Control size — trickles to the control.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the field and control to fill the container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    color: {
      control: { type: 'select' },
      options: formColorTokens,
      description: 'Accent color — trickles to the control.',
      table: { category: 'Visual' },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color for the label/helper/input — resolves against `theme.text`.',
      table: { category: 'Visual' },
    },
    p,
    m,
  },
}

export default meta
type Story = StoryObj<typeof FormControl>

export const Default: Story = {
  args: { required: true, fullWidth: true },
  render: (args) => (
    <FormControl {...args}>
      <Flex flexDirection="column" gap={1} alignItems="flex-start">
        <FormLabel>Email</FormLabel>
        <TextInput variant="outlined" placeholder="me@example.com" />
        <FormHelperText>We'll never share it.</FormHelperText>
      </Flex>
    </FormControl>
  ),
}

export const ErrorState: Story = {
  args: { error: true, required: true, fullWidth: true },
  render: (args) => (
    <FormControl {...args}>
      <Flex flexDirection="column" gap={1} alignItems="flex-start">
        <FormLabel>Email</FormLabel>
        <TextInput variant="outlined" value="not-an-email" onChange={() => {}} />
        <FormHelperText>Enter a valid e-mail address.</FormHelperText>
      </Flex>
    </FormControl>
  ),
}
