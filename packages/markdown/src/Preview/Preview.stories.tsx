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
  '',
  '```mermaid',
  'sequenceDiagram',
  'Alice->>John: Hello John, how are you?',
  'loop HealthCheck',
  '    John->>John: Fight against hypochondria',
  'end',
  'Note right of John: Rational thoughts!',
  'John-->>Alice: Great!',
  'John->>Bob: How about you?',
  'Bob-->>John: Jolly good!',
  '```',
].join('\n')

const MERMAID = [
  '# Flow diagram',
  '',
  'A fenced `mermaid` block renders as a themed diagram instead of a code block:',
  '',
  '```mermaid',
  'graph TD',
  '  A[Markdown source] --> B{Fenced mermaid?}',
  '  B -->|yes| C[Render as diagram]',
  '  B -->|no| D[Render as code]',
  '```',
].join('\n')

// A diagram can carry its own `config` frontmatter — mermaid applies these `themeVariables`
// per-diagram, overriding the theme-derived defaults the Mermaid component supplies.
const MERMAID_CONFIG = [
  '```mermaid',
  '---',
  'config:',
  "  theme: 'base'",
  '  themeVariables:',
  "    primaryColor: '#BB2528'",
  "    primaryTextColor: '#fff'",
  "    primaryBorderColor: '#7C0000'",
  "    lineColor: '#F8B229'",
  "    secondaryColor: '#006100'",
  "    tertiaryColor: '#fff'",
  '---',
  'graph TD',
  '  A[Christmas] -->|Get money| B(Go shopping)',
  '  B --> C{Let me think}',
  '  B --> G[/Another/]',
  '  C ==>|One| D[Laptop]',
  '  C -->|Two| E[iPhone]',
  '  C -->|Three| F[fa:fa-car Car]',
  '  subgraph section',
  '    C',
  '    D',
  '    E',
  '    F',
  '    G',
  '  end',
  '```',
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

// A ` ```mermaid ` fenced block is rendered as a diagram, themed from the active theme.
export const MermaidDiagram: Story = {
  args: { children: MERMAID },
}

// A diagram overriding its colors via inline `config` frontmatter `themeVariables`.
export const MermaidConfig: Story = {
  args: { children: MERMAID_CONFIG },
}
