import type { Meta, StoryObj } from '@storybook/react-vite'
import { Preview } from './Preview'

const SAMPLE = [
  '# Heading',
  '',
  'A paragraph with **bold**, _italic_, `code`, and a [link](https://example.com).',
  '',
  '- [x] a done task',
  '- [ ] a pending task',
  '',
  '> A blockquote.',
  '',
  '```ts',
  'const answer: number = 42',
  '```',
  '',
  '| Name | Role |',
  '| :--- | ---: |',
  '| Ada  | Dev  |',
].join('\n')

const meta: Meta<typeof Preview> = {
  title: 'Theme/Markdown/Preview',
  component: Preview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['children', 'slotProps'] },
  },
  args: {
    children: SAMPLE,
    slotProps: { p: { color: 'secondary' }, h1: { color: 'primary' } },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The markdown source to render.',
      table: { category: 'Content' },
    },
    slotProps: {
      control: 'object',
      description:
        'Per-element prop overrides, merged over the defaults. Keyed by markdown tag (h1–h6, p, a, li, code, blockquote, table, …).',
      table: { category: 'Behavior' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Preview>

export const Default: Story = {}

// `slotProps` overrides any element's props (merged over the defaults — the override wins).
export const WithOverrides: Story = {
  args: {
    children: SAMPLE,
    slotProps: {
      p: { color: 'primary', variant: 'body2' },
      a: { underline: 'always' },
    },
  },
}
