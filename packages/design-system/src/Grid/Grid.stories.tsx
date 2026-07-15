import type { Meta, StoryObj } from '@storybook/react-vite'
import { gap } from '../utils/test/storiesArgs'
import {
  gridAlignContentTokens,
  gridAlignItemsTokens,
  gridAutoFlowTokens,
  gridJustifyContentTokens,
  gridJustifyItemsTokens,
  spaceTokens,
} from '../utils/test/storiesOptions'
import { Flex } from '../Flex'
import { View } from '../View'
import { Typography } from '../Typography'
import { Grid } from './Grid'

const Cell = ({ label }: { label: string }) => (
  <Flex p={2} bg="secondary" borderRadius="sm" alignItems="center" justifyContent="center">
    {label}
  </Flex>
)

const MDN_GRID_URL = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout'
const RAW_CSS = `Raw CSS string — grid layout values are structurally varied and can't be reduced to a fixed token set. See the [MDN Grid reference](${MDN_GRID_URL}) for all valid values.`

const meta: Meta<typeof Grid> = {
  title: 'Theme/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `A \`<div>\` with \`display: grid\` that extends **View**. Layout props (\`gridTemplateColumns\`, \`gridTemplateAreas\`, etc.) accept raw CSS strings — grid structures are too varied for a fixed token set. The \`gap\` prop is the exception: it resolves from \`theme.space\` like all spacing props.\n\n[MDN CSS Grid Layout reference](${MDN_GRID_URL})`,
      },
    },
    controls: {
      include: [
        'gridTemplateColumns',
        'gridTemplateRows',
        'gridTemplateAreas',
        'gridAutoFlow',
        'gridAutoColumns',
        'gridAutoRows',
        'gap',
        'columnGap',
        'rowGap',
        'justifyContent',
        'alignItems',
        'alignContent',
        'justifyItems',
        'p',
        'm',
      ],
    },
  },
  argTypes: {
    gridTemplateColumns: {
      control: 'text',
      description: `Defines column track sizes. ${RAW_CSS}\n\n**Examples:** \`"repeat(3, 1fr)"\` · \`"200px 1fr"\` · \`"repeat(auto-fill, minmax(240px, 1fr))"\``,
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    gridTemplateRows: {
      control: 'text',
      description: `Defines row track sizes. ${RAW_CSS}\n\n**Examples:** \`"60px auto 40px"\` · \`"repeat(3, 100px)"\``,
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    gridTemplateAreas: {
      control: 'text',
      description: `Assigns named areas to grid cells using quoted row strings. ${RAW_CSS}\n\n**Example:** \`'"header header" "sidebar main"'\``,
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    gridAutoFlow: {
      control: { type: 'inline-radio' },
      options: gridAutoFlowTokens,
      description:
        'Controls the auto-placement algorithm direction. `row` fills each row before moving to the next; `column` fills each column first; `dense` backfills holes left by larger items.',
      table: { category: 'Layout', type: { summary: 'string' }, defaultValue: { summary: 'row' } },
    },
    gridAutoColumns: {
      control: 'text',
      description: `Size applied to implicitly created columns (columns not defined in \`gridTemplateColumns\`). ${RAW_CSS}\n\n**Examples:** \`"100px"\` · \`"minmax(100px, auto)"\``,
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    gridAutoRows: {
      control: 'text',
      description: `Size applied to implicitly created rows (rows not defined in \`gridTemplateRows\`). ${RAW_CSS}\n\n**Examples:** \`"80px"\` · \`"minmax(60px, auto)"\``,
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    gap: {
      ...gap,
      description:
        'Gap between all rows and columns — resolves from `theme.space`. Unlike the other grid props, this uses theme tokens (not a raw CSS string).',
    },
    columnGap: {
      control: { type: 'select' },
      options: spaceTokens,
      description:
        'Gap between columns — resolves from `theme.space`. Use when column and row gaps should differ; prefer `gap` when both axes match.',
      table: { category: 'Spacing', type: { summary: 'GapToken' }, defaultValue: { summary: '0' } },
    },
    rowGap: {
      control: { type: 'select' },
      options: spaceTokens,
      description:
        'Gap between rows — resolves from `theme.space`. Use when column and row gaps should differ; prefer `gap` when both axes match.',
      table: { category: 'Spacing', type: { summary: 'GapToken' }, defaultValue: { summary: '0' } },
    },
    justifyContent: {
      control: { type: 'select' },
      options: gridJustifyContentTokens,
      description: 'Aligns grid tracks along the inline (row) axis when there is extra space.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    alignItems: {
      control: { type: 'select' },
      options: gridAlignItemsTokens,
      description: 'Aligns grid items within their cell along the block (column) axis.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    alignContent: {
      control: { type: 'select' },
      options: gridAlignContentTokens,
      description: 'Aligns grid tracks along the block (column) axis when there is extra space.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
    justifyItems: {
      control: { type: 'select' },
      options: gridJustifyItemsTokens,
      description: 'Aligns grid items within their cell along the inline (row) axis.',
      table: { category: 'Layout', type: { summary: 'string' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof Grid>

export const Default: Story = {
  args: {
    gridTemplateColumns: '1fr 1fr',
    gap: 2,
  },
  render: (args) => (
    <Grid {...args}>
      <Cell label="A" />
      <Cell label="B" />
      <Cell label="C" />
      <Cell label="D" />
    </Grid>
  ),
}

export const PlacementExample: Story = {
  render: () => (
    <Grid
      gridTemplateColumns="repeat(3, 1fr)"
      gap={1}
      gridAutoRows="minmax(100px, auto)"
      maxWidth="940px"
    >
      <Grid
        gridColumn="1 / 3"
        gridRow="1"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        One
      </Grid>
      <Grid
        gridColumn="2 / 4"
        gridRow="1 / 3"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        Two
      </Grid>
      <Grid
        gridColumn="1"
        gridRow="2 / 5"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        Three
      </Grid>
      <Grid
        gridColumn="3"
        gridRow="3"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        Four
      </Grid>
      <Grid
        gridColumn="2"
        gridRow="4"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        Five
      </Grid>
      <Grid
        gridColumn="3"
        gridRow="4"
        bg="backdrop"
        borderColor="primary"
        borderWidth="thin"
        borderStyle="solid"
        borderRadius="sm"
        p={2}
      >
        Six
      </Grid>
    </Grid>
  ),
}

export const ColumnRowGap: Story = {
  args: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: 4,
    rowGap: 1,
  },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }, (_, i) => (
        <Cell key={i} label={String(i + 1)} />
      ))}
    </Grid>
  ),
}

export const ThreeColumns: Story = {
  render: () => (
    <Grid gridTemplateColumns="repeat(3, 1fr)" gap={3} p={2}>
      {Array.from({ length: 6 }, (_, i) => (
        <Cell key={i} label={String(i + 1)} />
      ))}
    </Grid>
  ),
}

export const AutoFill: Story = {
  render: () => (
    <Grid gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={2} p={2}>
      {Array.from({ length: 8 }, (_, i) => (
        <Cell key={i} label={String(i + 1)} />
      ))}
    </Grid>
  ),
}

export const NamedAreas: Story = {
  render: () => (
    <Grid
      gridTemplateAreas='"header header" "sidebar content" "footer footer"'
      gridTemplateColumns="180px 1fr"
      gridTemplateRows="auto 1fr auto"
      gap={2}
      p={2}
      height="300px"
    >
      <View bg="primary" p={2} borderRadius="sm" style={{ gridArea: 'header' }}>
        header
      </View>
      <View bg="secondary" p={2} borderRadius="sm" style={{ gridArea: 'sidebar' }}>
        sidebar
      </View>
      <View bg="secondary" p={2} borderRadius="sm" style={{ gridArea: 'content' }}>
        content
      </View>
      <View bg="primary" p={2} borderRadius="sm" style={{ gridArea: 'footer' }}>
        footer
      </View>
    </Grid>
  ),
}

export const GapScale: Story = {
  render: () => (
    <Grid gridTemplateColumns="1fr" gap={0}>
      {([0, 0.5, 1, 2, 3, 4] as const).map((g) => (
        <View key={g} mb={3}>
          <Typography variant="caption" as="div" color="secondary" mb={0.5}>
            gap={`{${g}}`}
          </Typography>
          <Grid gridTemplateColumns="1fr 1fr 1fr" gap={g}>
            <Cell label="A" />
            <Cell label="B" />
            <Cell label="C" />
          </Grid>
        </View>
      ))}
    </Grid>
  ),
}

export const AutoRows: Story = {
  render: () => (
    <Grid gridTemplateColumns="1fr" gap={0}>
      <Typography variant="caption" as="div" color="secondary" mb={1}>
        Without gridAutoRows — row height follows content
      </Typography>
      <Grid gridTemplateColumns="repeat(4, 1fr)" gap={2} mb={4}>
        <Cell label="short" />
        <View bg="secondary" borderRadius="sm" p={2}>
          tall content that grows the row
        </View>
        <Cell label="short" />
        <Cell label="short" />
      </Grid>

      <Typography variant="caption" as="div" color="secondary" mb={1}>
        gridAutoRows="80px" — all rows fixed height
      </Typography>
      <Grid gridTemplateColumns="repeat(4, 1fr)" gridAutoRows="80px" gap={2}>
        <Cell label="1" />
        <Cell label="2" />
        <Cell label="3" />
        <Cell label="4" />
        <Cell label="5" />
        <Cell label="6" />
        <Cell label="7" />
        <Cell label="8" />
      </Grid>
    </Grid>
  ),
}

export const AutoFlow: Story = {
  render: () => (
    <Grid gridTemplateColumns="1fr" gap={0}>
      <Typography variant="caption" as="div" color="secondary" mb={1}>
        gridAutoFlow="row" (default) — items fill row by row
      </Typography>
      <Grid gridTemplateColumns="repeat(3, 1fr)" gridAutoFlow="row" gap={2} mb={4}>
        {['A', 'B', 'C', 'D', 'E', 'F'].map((l) => (
          <Cell key={l} label={l} />
        ))}
      </Grid>

      <Typography variant="caption" as="div" color="secondary" mb={1}>
        gridAutoFlow="column" — items fill column by column
      </Typography>
      <Grid gridTemplateRows="repeat(2, 60px)" gridAutoFlow="column" gap={2}>
        {['A', 'B', 'C', 'D', 'E', 'F'].map((l) => (
          <Cell key={l} label={l} />
        ))}
      </Grid>
    </Grid>
  ),
}

export const SpanningItems: Story = {
  render: () => (
    <Grid gridTemplateColumns="repeat(3, 1fr)" gap={2}>
      <Grid gridColumn="1 / -1" bg="primary" p={2} borderRadius="sm" justifyContent="center">
        gridColumn="1 / -1" — full width
      </Grid>
      <Cell label="1" />
      <Cell label="2" />
      <Cell label="3" />
      <Grid gridColumn="1 / 3" bg="secondary" p={2} borderRadius="sm" justifyContent="center">
        gridColumn="1 / 3" — spans 2
      </Grid>
      <Cell label="5" />
      <Cell label="6" />
      <Grid
        gridRow="3 / 5"
        gridColumn="3"
        bg="primary"
        p={2}
        borderRadius="sm"
        justifyContent="center"
      >
        gridRow="3/5"
      </Grid>
      <Cell label="7" />
    </Grid>
  ),
}

export const AsymmetricGap: Story = {
  render: () => (
    <Grid gridTemplateColumns="1fr" gap={0}>
      <Typography variant="caption" as="div" color="secondary" mb={1}>
        columnGap={'{4}'} (32px) · rowGap={'{1}'} (8px)
      </Typography>
      <Grid gridTemplateColumns="repeat(3, 1fr)" columnGap={4} rowGap={1} mb={4}>
        {Array.from({ length: 6 }, (_, i) => (
          <Cell key={i} label={String(i + 1)} />
        ))}
      </Grid>

      <Typography variant="caption" as="div" color="secondary" mb={1}>
        columnGap={'{1}'} · rowGap={'{4}'}
      </Typography>
      <Grid gridTemplateColumns="repeat(3, 1fr)" columnGap={1} rowGap={4}>
        {Array.from({ length: 6 }, (_, i) => (
          <Cell key={i} label={String(i + 1)} />
        ))}
      </Grid>
    </Grid>
  ),
}

export const GridAreaProp: Story = {
  render: () => (
    <Grid
      gridTemplateAreas='"header header header" "sidebar main main" "footer footer footer"'
      gridTemplateColumns="140px 1fr 1fr"
      gridTemplateRows="48px 1fr 40px"
      gap={2}
      p={2}
      height="280px"
    >
      <Grid gridArea="header" bg="primary" p={2} borderRadius="sm" alignItems="center">
        gridArea="header"
      </Grid>
      <Grid gridArea="sidebar" bg="secondary" p={2} borderRadius="sm" alignItems="center">
        gridArea="sidebar"
      </Grid>
      <Grid gridArea="main" bg="secondary" p={2} borderRadius="sm" alignItems="center">
        gridArea="main"
      </Grid>
      <Grid gridArea="footer" bg="primary" p={2} borderRadius="sm" alignItems="center">
        gridArea="footer"
      </Grid>
    </Grid>
  ),
}
