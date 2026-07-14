import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button'
import { Typography } from '../Typography'
import { View } from '../View'
import { Popover, type PopoverProps, type PopoverOrigin } from './Popover'

/** Story-only args: the object origins are split into select boxes for easy tweaking. */
interface PopoverStoryArgs extends PopoverProps {
  anchorOriginVertical: PopoverOrigin['vertical']
  anchorOriginHorizontal: PopoverOrigin['horizontal']
  transformOriginVertical: PopoverOrigin['vertical']
  transformOriginHorizontal: PopoverOrigin['horizontal']
}

function PopoverDemo(props: Readonly<Partial<PopoverProps>>) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button onClick={(event) => setAnchor(event.currentTarget)}>Open popover</Button>
      {/* Spread first so the demo's own open/anchorEl/onClose always win over args. */}
      <Popover {...props} open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <View p={3} style={{ maxWidth: 240 }}>
          <Typography variant="body2">
            Portaled content, positioned relative to the button and closed on Escape or an outside
            click.
          </Typography>
        </View>
      </Popover>
    </>
  )
}

/** Composes the split origin args back into the object props Popover expects. */
function renderDemo({
  anchorOriginVertical,
  anchorOriginHorizontal,
  transformOriginVertical,
  transformOriginHorizontal,
  ...args
}: PopoverStoryArgs) {
  return (
    <PopoverDemo
      {...args}
      anchorOrigin={{ vertical: anchorOriginVertical, horizontal: anchorOriginHorizontal }}
      transformOrigin={{ vertical: transformOriginVertical, horizontal: transformOriginHorizontal }}
    />
  )
}

// Centers the trigger so a popover on any side stays inside the canvas.
const centeredDecorator = (Story: ComponentType) => (
  <View
    style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Story />
  </View>
)

const verticalOptions: PopoverOrigin['vertical'][] = ['top', 'center', 'bottom']
const horizontalOptions: PopoverOrigin['horizontal'][] = ['left', 'center', 'right']

const meta: Meta<PopoverStoryArgs> = {
  title: 'Theme/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'anchorReference',
        'anchorOriginVertical',
        'anchorOriginHorizontal',
        'transformOriginVertical',
        'transformOriginHorizontal',
        'marginThreshold',
        'elevation',
        'hasBackdrop',
        'disableScrollLock',
        'disableAriaHidden',
        'shouldAutoFocus',
        'shouldTrapFocus',
        'shouldEnforceFocus',
        'shouldRestoreFocus',
        'shouldKeepMounted',
        'layer',
      ],
    },
  },
  args: {
    anchorReference: 'anchorEl',
    anchorOriginVertical: 'bottom',
    anchorOriginHorizontal: 'left',
    transformOriginVertical: 'top',
    transformOriginHorizontal: 'left',
    elevation: 8,
    marginThreshold: 2,
    hasBackdrop: false,
    disableScrollLock: false,
    disableAriaHidden: false,
    shouldAutoFocus: true,
    shouldTrapFocus: true,
    shouldEnforceFocus: true,
    shouldRestoreFocus: true,
    shouldKeepMounted: false,
    layer: 'modal',
  },
  argTypes: {
    // ── Content / structural (managed by the demo, documented only) ──
    open: {
      control: false,
      description: 'If true, the popover is shown.',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      description: 'The content of the popover.',
      table: { category: 'Content' },
    },
    anchorEl: {
      control: false,
      description: 'Element (or getter) the popover is positioned against.',
      table: { category: 'Layout' },
    },
    anchorPosition: {
      control: false,
      description: "Client coordinates used when `anchorReference` is `'anchorPosition'`.",
      table: { category: 'Layout' },
    },
    anchorOrigin: {
      control: false,
      description: 'The point on the anchor the popover attaches to. Set via the split selects.',
      table: { category: 'Layout' },
    },
    transformOrigin: {
      control: false,
      description: 'The point on the popover that meets the anchor. Set via the split selects.',
      table: { category: 'Layout' },
    },
    onClose: {
      control: false,
      description: 'Fired on Escape or a click outside the surface.',
      table: { category: 'Behavior' },
    },
    container: {
      control: false,
      description: 'Portal target passed to the underlying Modal.',
      table: { category: 'Behavior' },
    },
    action: {
      control: false,
      description: 'Imperative handle exposing `updatePosition()`.',
      table: { category: 'Behavior' },
    },
    slotProps: {
      control: false,
      description: 'Props for the paper slot (the surface) — e.g. `bg`, `p`, `style`.',
      table: { category: 'Visual' },
    },
    // ── Positioning ──
    anchorReference: {
      control: { type: 'inline-radio' },
      options: ['anchorEl', 'anchorPosition', 'none'],
      description: 'Which anchor to position against.',
      table: { category: 'Layout', defaultValue: { summary: 'anchorEl' } },
    },
    anchorOriginVertical: {
      control: { type: 'select' },
      options: verticalOptions,
      description: 'Vertical point on the anchor the popover attaches to.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    anchorOriginHorizontal: {
      control: { type: 'select' },
      options: horizontalOptions,
      description: 'Horizontal point on the anchor the popover attaches to.',
      table: { category: 'Layout', defaultValue: { summary: 'left' } },
    },
    transformOriginVertical: {
      control: { type: 'select' },
      options: verticalOptions,
      description: 'Vertical point on the popover that meets the anchor.',
      table: { category: 'Layout', defaultValue: { summary: 'top' } },
    },
    transformOriginHorizontal: {
      control: { type: 'select' },
      options: horizontalOptions,
      description: 'Horizontal point on the popover that meets the anchor.',
      table: { category: 'Layout', defaultValue: { summary: 'left' } },
    },
    marginThreshold: {
      control: { type: 'select' },
      options: [0, 0.5, 1, 1.5, 2, 3, 4],
      description:
        'Minimum gap from the viewport edge as a spacing token (`theme.space`, e.g. `2` → 16px).',
      table: { category: 'Layout', defaultValue: { summary: '2' } },
    },
    // ── Visual ──
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Shadow depth of the surface — resolves against `theme.shadows`.',
      table: { category: 'Visual', defaultValue: { summary: '8' } },
    },
    // ── Behavior ──
    hasBackdrop: {
      control: 'boolean',
      description: 'Render a dimmed backdrop instead of the invisible click-away layer.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disableScrollLock: {
      control: 'boolean',
      description: 'Disable body scroll-lock; the popover then re-positions on scroll.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disableAriaHidden: {
      control: 'boolean',
      description: 'Skip `aria-hidden` on background content (for non-modal popovers).',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    shouldKeepMounted: {
      control: 'boolean',
      description: 'Keep the content mounted while closed.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    layer: {
      control: { type: 'select' },
      options: ['appBar', 'drawer', 'modal'],
      description: 'Stacking layer from `theme.zOrder`.',
      table: { category: 'Behavior', defaultValue: { summary: 'modal' } },
    },
    // ── Focus ──
    shouldAutoFocus: {
      control: 'boolean',
      description: 'Move focus into the popover on open.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldTrapFocus: {
      control: 'boolean',
      description: 'Trap Tab focus within the popover.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldEnforceFocus: {
      control: 'boolean',
      description: 'Pull focus back whenever it escapes.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
    shouldRestoreFocus: {
      control: 'boolean',
      description: 'Restore focus to the trigger on close.',
      table: { category: 'Focus', defaultValue: { summary: 'true' } },
    },
  },
  render: renderDemo,
}

export default meta
type Story = StoryObj<PopoverStoryArgs>

export const Default: Story = {}

export const WithBackdrop: Story = {
  args: { hasBackdrop: true },
}

// ── Placement examples: the popover opens on each side of the anchor ──

/** Below the anchor (default). */
export const Bottom: Story = {
  decorators: [centeredDecorator],
  args: {
    anchorOriginVertical: 'bottom',
    anchorOriginHorizontal: 'left',
    transformOriginVertical: 'top',
    transformOriginHorizontal: 'left',
  },
}

/** Above the anchor. */
export const Top: Story = {
  decorators: [centeredDecorator],
  args: {
    anchorOriginVertical: 'top',
    anchorOriginHorizontal: 'left',
    transformOriginVertical: 'bottom',
    transformOriginHorizontal: 'left',
  },
}

/** To the right of the anchor. */
export const Right: Story = {
  decorators: [centeredDecorator],
  args: {
    anchorOriginVertical: 'top',
    anchorOriginHorizontal: 'right',
    transformOriginVertical: 'top',
    transformOriginHorizontal: 'left',
  },
}

/** To the left of the anchor. */
export const Left: Story = {
  decorators: [centeredDecorator],
  args: {
    anchorOriginVertical: 'top',
    anchorOriginHorizontal: 'left',
    transformOriginVertical: 'top',
    transformOriginHorizontal: 'right',
  },
}
