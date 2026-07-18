import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramViewer } from './DiagramViewer'

// A static sample SVG so the viewer renders deterministically without mermaid.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200" viewBox="0 0 360 200">
  <rect x="8" y="8" width="344" height="184" rx="10" fill="none" stroke="#00FC40" stroke-width="2"/>
  <text x="180" y="108" text-anchor="middle" fill="#00FC40" font-family="monospace" font-size="18">Sample diagram</text>
</svg>`

const meta: Meta<typeof DiagramViewer> = {
  title: 'Theme/Markdown/DiagramViewer',
  component: DiagramViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { include: ['svg', 'expandable', 'fill'] },
  },
  args: { svg: SVG, expandable: true, fill: false },
  argTypes: {
    svg: {
      control: 'text',
      description: 'The rendered SVG markup to display.',
      table: { category: 'Content' },
    },
    expandable: {
      control: 'boolean',
      description: 'Show the expand-to-fullscreen control and dialog.',
      table: { category: 'Behavior' },
    },
    fill: {
      control: 'boolean',
      description: "Fill the parent's height — used by the nested viewer inside the dialog.",
      table: { category: 'Layout' },
    },
  },
}

export default meta
type Story = StoryObj<typeof DiagramViewer>

export const Default: Story = {}
