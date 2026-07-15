import { useState, type SVGProps } from 'react'
import type { Meta, StoryObj, Decorator } from '@storybook/react-vite'
import { border, m, p, position } from '../utils/test/storiesArgs'
import { appBarSizeTokens, backgroundTokens } from '../utils/test/storiesOptions'
import { ThemeProvider } from '../ThemeProvider'
import { baseTheme, createTheme } from '../themes'

// Story-local light variant — the package ships only `baseTheme`; consumers
// build their own light themes the same way.
const light = createTheme(baseTheme, {
  name: 'light',
  colorScheme: 'light',
  background: {
    appBar: '#F9F9F9CC',
    paper: '#F3F3F3',
    default: '#FFFFFF',
    primary: '#F9F9F9',
    secondary: '#EEEEEE',
  },
  text: { initial: '#1A1C1C', secondary: '#444748' },
  border: { default: '#D7D8DA' },
})
import { Avatar } from '../Avatar'
import { Flex } from '../Flex'
import { Link } from '../Link'
import { Typography } from '../Typography'
import { Switch } from '../Switch'
import { View } from '../View'
import { AppBar } from './AppBar'

// Story-local copies of the app's sun/moon assets — the package has no svgr pipeline.
const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="0.6em"
    height="0.6em"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={12} cy={12} r={4} />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)
const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="0.6em"
    height="0.6em"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
// Public site asset served by the app's Storybook.
const Logo = '/soroush.svg'

const meta: Meta<typeof AppBar> = {
  title: 'Theme/AppBar',
  component: AppBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['children', 'color', 'size', 'elevation', 'position', 'blur', 'border', 'm', 'p'],
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Content rendered inside the AppBar.',
      table: { category: 'Content' },
    },
    color: {
      control: { type: 'select' },
      options: backgroundTokens,
      description: 'Background color — resolves from theme.background.',
      table: { category: 'Visual' },
    },
    size: {
      control: { type: 'select' },
      options: appBarSizeTokens,
      description: 'Padding preset — resolves from theme.sizes. Default: "md".',
      table: { category: 'Visual', defaultValue: { summary: 'md' } },
    },
    elevation: {
      control: { type: 'number', min: 0, max: 24 },
      description: 'Box-shadow elevation — resolves from theme.shadows[n]. Omit for no shadow.',
      table: { category: 'Visual' },
    },
    position,
    blur: {
      control: 'boolean',
      description:
        'Applies `backdrop-filter: blur(theme.blur)` + `-webkit-` prefix. Use with `color="backdrop"` for a frosted-glass effect.',
      table: { category: 'Visual', defaultValue: { summary: 'false' } },
    },
    border,
    m,
    p,
  },
}

export default meta
type Story = StoryObj<typeof AppBar>

export const Default: Story = {
  args: {
    color: 'paper',
    children: 'Application Header',
  },
}

export const Colors: Story = {
  render: () => (
    <Flex flexDirection="column">
      {(['paper', 'primary', 'secondary', 'modal'] as const).map((color) => (
        <AppBar key={color} color={color} mb={1}>
          <Flex flexDirection="row" alignItems="center" px={2} py={1.5}>
            <Typography variant="caption" color="secondary" m={0}>
              color="{color}"
            </Typography>
          </Flex>
        </AppBar>
      ))}
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex flexDirection="column">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <AppBar key={size} size={size} color="paper" mb={1}>
          <Flex flexDirection="row" alignItems="center">
            <Typography variant="caption" color="secondary" m={0}>
              size=&quot;{size}&quot;
            </Typography>
          </Flex>
        </AppBar>
      ))}
    </Flex>
  ),
}

export const Positions: Story = {
  render: () => (
    <Flex flexDirection="column">
      {(['static', 'relative', 'sticky'] as const).map((pos) => (
        <AppBar key={pos} position={pos} color="paper" mb={1}>
          <Flex flexDirection="row" alignItems="center" px={2} py={1.5}>
            <Typography variant="caption" color="secondary" m={0}>
              position=&quot;{pos}&quot;
            </Typography>
          </Flex>
        </AppBar>
      ))}
      {(['absolute', 'fixed'] as const).map((pos) => (
        <Flex key={pos} position="relative" height="48px" mb={1}>
          <AppBar position={pos} color="paper">
            <Flex flexDirection="row" alignItems="center" px={2} py={1.5}>
              <Typography variant="caption" color="secondary" m={0}>
                position=&quot;{pos}&quot;
              </Typography>
            </Flex>
          </AppBar>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Elevations: Story = {
  render: () => (
    <Flex flexDirection="column">
      {([0, 4, 8, 12, 16, 24] as const).map((elevation) => (
        <AppBar key={elevation} elevation={elevation} color="paper" mb={1}>
          <Flex flexDirection="row" alignItems="center" px={2} py={1.5}>
            <Typography variant="caption" color="secondary" m={0}>
              elevation={elevation}
            </Typography>
          </Flex>
        </AppBar>
      ))}
    </Flex>
  ),
}

const NAV_LINKS = ['Home', 'Experience', 'Stack', 'Architecture', 'Contact'] as const

export const SiteHeader: Story = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
  render: () => (
    <AppBar
      color="primary"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      elevation={4}
      minHeight={64}
    >
      {/* Logo */}
      <Flex flexDirection="row" alignItems="center" gap={2}>
        <Avatar variant="square" size="sm" src={Logo} alt="Masoud Soroush">
          <Typography variant="caption" color="primary" m={0}>
            M
          </Typography>
        </Avatar>
        <Typography variant="h6" color="secondary" m={0} fontFamily="monospace">
          Masoud Soroush
        </Typography>
      </Flex>

      {/* Nav */}
      <Flex flexDirection="row" alignItems="center" gap={3}>
        {NAV_LINKS.map((label, i) => (
          <Link
            key={label}
            underline="hover"
            color={i === 0 ? 'secondary' : 'initial'}
            m={0}
            fontFamily="monospace"
          >
            {label}
          </Link>
        ))}
      </Flex>

      {/* Actions */}
      <Flex flexDirection="row" alignItems="center" gap={1}>
        <View height="32px" mx={2} width="2px" bg="grid" />
        <Flex flexDirection="column" alignItems="flex-end">
          <Typography
            variant="caption"
            color="secondary"
            m={0}
            style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}
          >
            Status
          </Typography>
          <Typography
            variant="caption"
            color="primary"
            m={0}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          >
            OPTIMIZED
          </Typography>
        </Flex>
      </Flex>
    </AppBar>
  ),
}

export const Frosted: Story = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
  render: () => (
    <AppBar
      color="backdrop"
      blur
      borderBottom="1px solid rgba(0,0,0,0.1)"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      elevation={0}
      minHeight={64}
    >
      <Typography variant="h6" color="secondary" m={0}>
        Frosted Glass Header
      </Typography>
      <Typography variant="caption" color="secondary" m={0}>
        blur + color="backdrop"
      </Typography>
    </AppBar>
  ),
}

interface DarkModeArgs {
  isDark: boolean
  onToggle: () => void
}

// Owns the theme-mode state and ThemeProvider in a decorator, injecting `isDark` and
// `onToggle` into the story so the toggle Switch can stay inside the AppBar content.
const WithThemeToggle: Decorator = (Story, ctx) => {
  const [isDark, setIsDark] = useState(false)
  return (
    <ThemeProvider theme={isDark ? baseTheme : light}>
      <Story args={{ ...ctx.args, isDark, onToggle: () => setIsDark((value) => !value) }} />
    </ThemeProvider>
  )
}

export const DarkMode: StoryObj<DarkModeArgs> = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
  decorators: [WithThemeToggle],
  render: ({ isDark, onToggle }) => (
    <AppBar
      color="secondary"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      elevation={4}
      minHeight={64}
    >
      <Flex flexDirection="row" alignItems="center" gap={2}>
        <Avatar variant="square" size="sm" src={Logo} alt="Masoud Soroush">
          <Typography variant="caption" color="primary" m={0}>
            M
          </Typography>
        </Avatar>
        <Typography variant="h6" color="secondary" m={0} fontFamily="monospace">
          Masoud Soroush
        </Typography>
      </Flex>

      <Flex flexDirection="row" alignItems="center" gap={3}>
        {NAV_LINKS.map((label, i) => (
          <Link
            key={label}
            underline="hover"
            color={i === 0 ? 'secondary' : 'initial'}
            m={0}
            fontFamily="monospace"
          >
            {label}
          </Link>
        ))}
      </Flex>

      <Switch
        checked={isDark}
        color="default"
        onChange={onToggle}
        icon={<SunIcon aria-hidden="true" width={14} height={14} />}
        checkedIcon={<MoonIcon aria-hidden="true" width={14} height={14} />}
        aria-label="Toggle dark mode"
      />
    </AppBar>
  ),
}
