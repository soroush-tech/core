import {
  backgroundTokens,
  borderColorTokens,
  borderRadiiTokens,
  borderStyleTokens,
  borderWidthTokens,
  buttonColorTokens,
  cursorTokens,
  displayTokens,
  positionTokens,
  spaceTokens,
  tableSizeTokens,
} from 'src/theme/utils/test/storiesOptions'

// ─── Visual ──────────────────────────────────────────────────────────────────
export const bg = {
  control: { type: 'select' },
  options: backgroundTokens,
  description: 'Background color — resolves from `theme.background`.',
  table: { category: 'Visual' },
} as const
export const opacity = {
  control: { type: 'range', min: 0, max: 1, step: 0.05 },
  description: 'CSS opacity (0–1).',
  table: { category: 'Visual' },
} as const

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const p = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Padding — resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const m = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Margin — resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const mb = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Margin bottom — resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'space' }, defaultValue: { summary: '0' } },
} as const
export const gap = {
  control: { type: 'select' },
  options: spaceTokens,
  description: 'Gap between items — resolves from `theme.space`.',
  table: { category: 'Spacing', type: { summary: 'GapToken' }, defaultValue: { summary: '0' } },
} as const

// ─── Layout ─────────────────────────────────────────────────────────────────
export const width = {
  control: 'text',
  description: 'CSS width — any valid value.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const height = {
  control: 'text',
  description: 'CSS height — any valid value.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const minWidth = {
  control: 'text',
  description: 'CSS min-width.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const minHeight = {
  control: 'text',
  description: 'CSS min-height.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const maxWidth = {
  control: 'text',
  description: 'CSS max-width.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const maxHeight = {
  control: 'text',
  description: 'CSS max-height.',
  table: { category: 'Layout', type: { summary: 'string | number' } },
} as const
export const display = {
  control: { type: 'select' },
  options: displayTokens,
  description: 'CSS display property.',
  table: { category: 'Layout', type: { summary: 'string' } },
} as const
export const position = {
  control: { type: 'select' },
  options: positionTokens,
  description: 'CSS position property.',
  table: { category: 'Layout', type: { summary: 'string' } },
} as const
export const cursor = {
  control: { type: 'select' },
  options: cursorTokens,
  description: 'CSS cursor — controls the mouse pointer style.',
  table: { category: 'Visual', type: { summary: 'CSSProperties["cursor"]' } },
} as const
export const aspectRatio = {
  control: 'text',
  description: 'CSS aspect-ratio for fixed-ratio surfaces (e.g. "16/9", "1").',
  table: { category: 'Layout', type: { summary: 'CSSProperties["aspectRatio"]' } },
} as const
export const order = {
  control: 'number',
  description: 'CSS order for flex/grid item placement. Accepts responsive arrays.',
  table: { category: 'Layout', type: { summary: 'CSSProperties["order"]' } },
} as const

// ─── Border ─────────────────────────────────────────────────────────────────
export const border = {
  control: 'text',
  description:
    'CSS border shorthand (e.g. `"1px solid"`). Width and style are raw CSS — use `borderRadius` for theme tokens.',
  table: { category: 'Visual', type: { summary: 'string' } },
} as const
export const borderWidth = {
  control: { type: 'select' },
  options: borderWidthTokens,
  description:
    'Border width — resolves from `theme.borderWidths`: none (0) · thin (1px) · base (2px) · thick (4px).',
  table: { category: 'Visual', type: { summary: 'none | thin | base | thick' } },
} as const
export const borderStyle = {
  control: { type: 'select' },
  options: borderStyleTokens,
  description: 'CSS border-style.',
  table: { category: 'Visual', type: { summary: 'string' } },
} as const
export const borderColor = {
  control: { type: 'select' },
  options: borderColorTokens,
  description: 'Border color — resolves from `theme.border`.',
  table: { category: 'Visual' },
} as const
export const borderRadius = {
  control: { type: 'select' },
  options: borderRadiiTokens,
  description: 'Border radius — resolves from `theme.radii`: sm (4px) · md (8px) · lg (16px).',
  table: { category: 'Visual', type: { summary: 'sm | md | lg' } },
} as const

// ─── Pagination ────────────────────────────────────────────────────────────
// Shared by the Pagination + PaginationItem + TablePagination story families.
export const paginationColor = {
  control: { type: 'select' },
  options: buttonColorTokens,
  description: 'Selected-item color — resolves against `theme.palette`.',
  table: { category: 'Visual', defaultValue: { summary: 'primary' } },
} as const
export const paginationVariant = {
  control: { type: 'select' },
  options: ['text', 'outlined'],
  description: 'Item style.',
  table: { category: 'Visual', defaultValue: { summary: 'text' } },
} as const
export const paginationShape = {
  control: { type: 'select' },
  options: ['circular', 'rounded'],
  description: 'Item corner shape.',
  table: { category: 'Visual', defaultValue: { summary: 'circular' } },
} as const
export const paginationSize = {
  control: { type: 'select' },
  options: tableSizeTokens,
  description: 'Item density — resolves against `theme.sizes`.',
  table: { category: 'Layout', defaultValue: { summary: 'md' } },
} as const
export const paginationCount = {
  control: { type: 'number', min: -1 },
  description: 'Total number of rows; `-1` = unknown (server-side pagination).',
  table: { category: 'Content' },
} as const
export const shouldShowFirstButton = {
  control: 'boolean',
  description: 'Shows the first-page button.',
  table: { category: 'Behavior', defaultValue: { summary: 'false' } },
} as const
export const shouldShowLastButton = {
  control: 'boolean',
  description: 'Shows the last-page button.',
  table: { category: 'Behavior', defaultValue: { summary: 'false' } },
} as const
