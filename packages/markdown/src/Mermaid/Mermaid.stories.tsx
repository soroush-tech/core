import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mermaid } from './Mermaid'

const CHART = `graph TD
  A[Start] --> B{Choice}
  B -->|Yes| C[Do it]
  B -->|No| D[Skip]`

const meta: Meta<typeof Mermaid> = {
  title: 'Theme/Markdown/Mermaid',
  component: Mermaid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['chart'] },
  },
  args: { chart: CHART },
  argTypes: {
    chart: {
      control: 'text',
      description: 'The mermaid diagram source — the body of a ` ```mermaid ` fence.',
      table: { category: 'Content' },
    },
  },
}

export default meta
type Story = StoryObj<typeof Mermaid>

export const Default: Story = {}

export const Sequence: Story = {
  args: { chart: 'sequenceDiagram\n  Alice->>Bob: Hi\n  Bob-->>Alice: Hello' },
}

// An invalid diagram falls back to its source in a CodeBlock instead of mermaid's error graphic.
export const InvalidFallsBackToSource: Story = {
  args: { chart: 'graph TD\n  A --> ' },
}
