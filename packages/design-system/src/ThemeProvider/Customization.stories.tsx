import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, type ButtonVariant } from '../Button'
import { ButtonGroup } from '../ButtonGroup'
import { Flex } from '../Flex'
import { Typography } from '../Typography'
import { createTheme, baseTheme } from '../themes'
import { ThemeProvider } from './ThemeProvider'

// Living documentation for theme-level component customization
// (`theme.components`): defaultProps, styleOverrides, and theme-contributed
// variants — locked by Chromatic so the customization contract can't silently break.

const customized = createTheme(baseTheme, {
  components: {
    Button: {
      defaultProps: { size: 'sm', shape: 'rounded' },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          letterSpacing: theme.letterSpacings.wide,
          ...(ownerState.variant === 'contained' && { textTransform: 'none' }),
        }),
      },
      variants: [
        {
          props: { variant: 'dashed' as ButtonVariant },
          style: ({ theme }) => ({
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
            border: `${theme.borderWidths.thin} dashed ${theme.border.primary}`,
          }),
        },
      ],
    },
  },
})

const meta: Meta<typeof ThemeProvider> = {
  title: 'Theme/Customization',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { disable: true },
  },
}

export default meta
type Story = StoryObj<typeof ThemeProvider>

export const ThemeComponents: Story = {
  render: () => (
    <ThemeProvider theme={customized}>
      <Flex flexDirection="column" gap={3} p={2}>
        <Flex flexDirection="column" gap={1}>
          <Typography variant="overline" color="secondary" m={0}>
            defaultProps — sm + rounded without touching call sites
          </Typography>
          <Flex flexDirection="row" gap={2}>
            <Button>Customized default</Button>
            <Button size="lg" shape="pill">
              Explicit props still win
            </Button>
          </Flex>
        </Flex>

        <Flex flexDirection="column" gap={1}>
          <Typography variant="overline" color="secondary" m={0}>
            styleOverrides — contained loses its uppercase via ownerState
          </Typography>
          <Flex flexDirection="row" gap={2}>
            <Button variant="contained">No Uppercase Here</Button>
            <Button variant="outlined">OUTLINED KEEPS IT</Button>
          </Flex>
        </Flex>

        <Flex flexDirection="column" gap={1}>
          <Typography variant="overline" color="secondary" m={0}>
            variants — a theme-contributed “dashed” value
          </Typography>
          <ButtonGroup>
            <Button variant={'dashed' as ButtonVariant}>Draft</Button>
            <Button variant={'dashed' as ButtonVariant}>Autosave</Button>
          </ButtonGroup>
        </Flex>
      </Flex>
    </ThemeProvider>
  ),
}
