import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Gist } from 'src/types/github'
import { Article } from './Article'

// A single gist's markdown body, exercising every element the Markdown component maps.
// Starts at h2 because the page renders the description as the h1 via PageHeader.
const ARTICLE = [
  '## Designing a token-driven system',
  '',
  'A paragraph with **bold**, *italic*, `inline code` and a [link](https://example.com).',
  '',
  '> A pull quote rendered through the Quote primitive.',
  '',
  '- First point',
  '- Second point',
  '',
  '```ts',
  'const answer = 42',
  '```',
].join('\n')

const data = {
  description: 'Designing a token-driven design system',
  files: { 'en.md': { content: ARTICLE } },
} as unknown as Gist

const meta = {
  title: 'Section/Article',
  component: Article,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { include: [] },
  },
  args: { data },
} satisfies Meta<typeof Article>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
