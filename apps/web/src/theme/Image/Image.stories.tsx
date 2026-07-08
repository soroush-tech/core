import type { Meta, StoryObj } from '@storybook/react-vite'
import { borderRadius, height, m, p, width } from 'src/theme/utils/test/storiesArgs'
import { objectFitTokens } from 'src/theme/utils/test/storiesOptions'
import { Image } from './Image'

const DEMO_IMG = '/soroush.svg'

const meta: Meta<typeof Image> = {
  title: 'Theme/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'src',
        'srcSet',
        'alt',
        'fallback',
        'width',
        'height',
        'objectFit',
        'borderRadius',
        'm',
        'p',
      ],
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Primary image URL.',
      table: { category: 'Content' },
    },
    srcSet: {
      control: 'text',
      description: 'Responsive image URLs — used as primary source when `src` is absent.',
      table: { category: 'Content' },
    },
    alt: {
      control: 'text',
      description: 'Alt text — required for accessibility.',
      table: { category: 'Content' },
    },
    fallback: {
      control: 'text',
      description: 'Fallback URL tried when primary source fails. `onError` fires when both fail.',
      table: { category: 'Content' },
    },
    width,
    height,
    objectFit: {
      control: { type: 'select' },
      options: objectFitTokens,
      description: 'CSS object-fit — controls how the image fills its container.',
      table: { category: 'Layout' },
    },
    borderRadius,
    m,
    p,
  },
}

export default meta
type Story = StoryObj<typeof Image>

export const Default: Story = {
  args: {
    src: DEMO_IMG,
    alt: 'Soroush logo',
    width: '200px',
    height: '200px',
    objectFit: 'contain',
  },
}

export const Cover: Story = {
  args: {
    src: DEMO_IMG,
    alt: 'Cover',
    width: '300px',
    height: '200px',
    objectFit: 'cover',
  },
}

export const WithFallback: Story = {
  args: {
    src: 'broken.jpg',
    fallback: DEMO_IMG,
    alt: 'With fallback',
    width: '200px',
    height: '200px',
    objectFit: 'contain',
  },
}

export const ObjectFitVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {objectFitTokens.map((fit) => (
        <div key={fit} style={{ textAlign: 'center' }}>
          <Image src={DEMO_IMG} alt={fit} width="150px" height="120px" objectFit={fit} />
          <p style={{ fontSize: '12px', margin: '4px 0 0' }}>{fit}</p>
        </div>
      ))}
    </div>
  ),
}
