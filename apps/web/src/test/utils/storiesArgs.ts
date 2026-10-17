import { spaceTokens } from './storiesOptions'

// Shared Storybook argTypes for props many of this app's stories expose.

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const p = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Padding - resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const m = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Margin - resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const mb = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Margin bottom - resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const gap = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Gap between items - resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'GapToken' }, defaultValue: { summary: '0' } },
} as const

// ─── Layout ─────────────────────────────────────────────────────────────────
export const height = {
  control: 'text',
  description: 'CSS height - any valid value.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const minHeight = {
  control: 'text',
  description: 'CSS min-height.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
