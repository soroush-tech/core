import { useState, type ChangeEvent } from 'react'
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite'
import { m, p, width, minWidth, maxWidth } from '../utils/test/storiesArgs'
import {
  textInputColorTokens,
  textInputVariantTokens,
  textInputSizeTokens,
  textColorTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Theme/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'variant',
        'color',
        'textColor',
        'disabled',
        'error',
        'readOnly',
        'required',
        'fullWidth',
        'multiline',
        'resize',
        'type',
        'size',
        'inputSize',
        'autoComplete',
        'placeholder',
        'rows',
        'minRows',
        'maxRows',
        'inputProps',
        'p',
        'm',
        'width',
        'minWidth',
        'maxWidth',
      ],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: textInputVariantTokens,
      description:
        '`outlined`/`default` — full border box · `underline` — bottom border only · `text` — no border.',
      table: { category: 'Visual', defaultValue: { summary: 'default' } },
    },
    color: {
      control: { type: 'select' },
      options: textInputColorTokens,
      description:
        'Border color token. `palette[color].main` on focus · `palette[color].light` when disabled.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    textColor: {
      control: { type: 'select' },
      options: textColorTokens,
      description: 'Text color of the typed value — resolves against `theme.text`.',
      table: { category: 'Visual', defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input. Border switches to `palette[color].light`.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Marks the field as invalid — border becomes `palette.error.main`.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Prevents changing the value while keeping the field interactive.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required for form submission.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretches the root to fill its container.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    multiline: {
      control: 'boolean',
      description:
        'Renders a `<textarea>`. Combine with `resize` for auto-growing or `rows` for a fixed height.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    resize: {
      control: 'boolean',
      description: 'Auto-grows the textarea as content increases. Requires `multiline`.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type. Non-text types disable `multiline` and `resize`.',
      table: { category: 'Behavior', defaultValue: { summary: 'text' } },
    },
    size: {
      control: { type: 'select' },
      options: textInputSizeTokens,
      description: 'Controls padding and font size.',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Short hint displayed before the user enters a value.',
      table: { category: 'Content' },
    },
    rows: {
      control: 'number',
      description: 'Fixes the textarea height. Also enables multiline when > 1.',
      table: { category: 'Behavior' },
    },
    minRows: {
      control: 'number',
      description: 'Minimum rows for the auto-grow textarea. Requires `resize`.',
      table: { category: 'Behavior' },
    },
    maxRows: {
      control: 'number',
      description:
        'Maximum rows before the auto-grow textarea starts scrolling. Requires `resize`.',
      table: { category: 'Behavior' },
    },
    inputSize: {
      control: 'number',
      description:
        'Native HTML `size` attribute — visible width in character widths. Has no effect with `multiline` or `resize`.',
      table: { category: 'Behavior' },
    },
    autoComplete: {
      control: 'text',
      description: 'Hints the browser for autofill. Accepts any valid HTML `autocomplete` value.',
      table: { category: 'Content' },
    },
    inputProps: {
      control: 'object',
      description:
        'Extra props spread onto the native element — e.g. `aria-label`, `cols`, `data-*`. Top-level props take priority.',
      table: { category: 'Behavior' },
    },
    p,
    m,
    width,
    minWidth,
    maxWidth,
  },
}

export default meta
type Story = StoryObj<typeof TextInput>

export const Default: Story = {
  args: {
    placeholder: 'Enter a value…',
    resize: false,
  },
}

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2} maxWidth="360px">
      {(
        [
          { label: 'Default', props: { placeholder: 'Default' } },
          { label: 'Disabled', props: { placeholder: 'Disabled', disabled: true } },
          {
            label: 'Disabled + value',
            props: { value: 'Cannot edit', disabled: true, onChange: () => {} },
          },
          { label: 'Error', props: { placeholder: 'Invalid field', error: true } },
          {
            label: 'Error + value',
            props: { value: 'bad@', error: true, onChange: () => {} },
          },
        ] as const
      ).map(({ label, props }) => (
        <Flex key={label} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="8rem" flexShrink={0} m={0}>
            {label}
          </Typography>
          <TextInput color="primary" fullWidth {...props} />
        </Flex>
      ))}
    </Flex>
  ),
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} maxWidth="560px">
      <Flex flexDirection="row" gap={2} mb={1}>
        {(['Normal', 'Disabled', 'Error'] as const).map((h) => (
          <Typography key={h} variant="caption" color="secondary" flex={1} m={0}>
            {h}
          </Typography>
        ))}
      </Flex>
      {(['outlined', 'underline', 'text'] as const).map((variant) => (
        <Flex key={variant} flexDirection="column" gap={1}>
          <Typography variant="caption" color="secondary" m={0}>
            {variant}
          </Typography>
          <Flex flexDirection="row" gap={2} alignItems="center">
            <TextInput variant={variant} color="primary" placeholder="Normal" fullWidth />
            <TextInput
              variant={variant}
              color="primary"
              placeholder="Disabled"
              disabled
              fullWidth
            />
            <TextInput variant={variant} color="primary" placeholder="Error" error fullWidth />
          </Flex>
        </Flex>
      ))}
    </Flex>
  ),
}

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors: Story = {
  render: () => (
    <Flex flexDirection="column" gap={3} maxWidth="560px">
      <Flex flexDirection="row" gap={2} mb={1}>
        {(['Default (click)', 'Disabled', 'Error'] as const).map((h) => (
          <Typography key={h} variant="caption" color="secondary" flex={1} m={0}>
            {h}
          </Typography>
        ))}
      </Flex>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning'] as const).map((color) => (
        <Flex key={color} flexDirection="column" gap={1}>
          <Typography variant="caption" color="secondary" m={0}>
            {color}
          </Typography>
          <Flex flexDirection="row" gap={2}>
            <TextInput variant="outlined" color={color} placeholder="Click to focus" fullWidth />
            <TextInput variant="outlined" color={color} placeholder="Disabled" disabled fullWidth />
            <TextInput variant="outlined" color={color} placeholder="Error" error fullWidth />
          </Flex>
        </Flex>
      ))}
    </Flex>
  ),
}

// ─── Multiline ────────────────────────────────────────────────────────────────

export const MultilineAutoGrow: Story = {
  name: 'Multiline — Auto-grow',
  render: () => (
    <Flex flexDirection="column" gap={1} maxWidth="480px">
      <Typography variant="caption" color="secondary" m={0}>
        Grows with content — no fixed height
      </Typography>
      <TextInput
        multiline
        resize
        fullWidth
        placeholder="Start typing… the field expands as you write."
      />
    </Flex>
  ),
}

export const MultilineFixedRows: Story = {
  name: 'Multiline — Fixed rows',
  render: () => (
    <Flex flexDirection="column" gap={1} maxWidth="480px">
      <Typography variant="caption" color="secondary" m={0}>
        Fixed to 4 rows — scrolls when content overflows
      </Typography>
      <TextInput rows={4} fullWidth placeholder="Write something…" />
    </Flex>
  ),
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  render: (args) => (
    <Flex width="100%" maxWidth="480px">
      <TextInput {...args} fullWidth placeholder="Full-width input…" />
    </Flex>
  ),
}

export const Types: Story = {
  render: () => (
    <Flex flexDirection="column" gap={2} maxWidth="360px">
      {(
        [
          { type: 'text', placeholder: 'Text' },
          { type: 'email', placeholder: 'email@example.com' },
          { type: 'password', placeholder: 'Password' },
          { type: 'number', placeholder: '0' },
          { type: 'search', placeholder: 'Search…' },
          { type: 'url', placeholder: 'https://' },
        ] as const
      ).map(({ type, placeholder }) => (
        <Flex key={type} flexDirection="row" alignItems="center" gap={3}>
          <Typography variant="caption" color="secondary" width="5rem" flexShrink={0} m={0}>
            {type}
          </Typography>
          <TextInput type={type} placeholder={placeholder} fullWidth />
        </Flex>
      ))}
    </Flex>
  ),
}

interface ControlledArgs {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

// Owns the input value state in a decorator and injects value + onChange via args.
const WithValueState: Decorator = (Story, ctx) => {
  const [value, setValue] = useState('')
  return (
    <Story
      args={{
        ...ctx.args,
        value,
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          setValue(e.target.value),
      }}
    />
  )
}

export const Controlled: StoryObj<ControlledArgs> = {
  decorators: [WithValueState],
  render: ({ value, onChange }) => (
    <Flex flexDirection="column" gap={2} maxWidth="360px">
      <TextInput fullWidth value={value} onChange={onChange} placeholder="Type something…" />
      <Typography variant="caption" color="secondary" m={0}>
        Value: {value || '(empty)'}
      </Typography>
    </Flex>
  ),
}
