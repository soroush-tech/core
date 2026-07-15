import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked, fn } from 'storybook/test'
import { useThemeMode } from 'src/theme/useThemeMode'
import { Header } from './Header'

const meta = {
  title: 'Common/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    urlPathname: '/',
  },
  args: {
    position: 'static',
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach() {
    mocked(useThemeMode).mockReturnValue({ isDark: false, toggleTheme: fn() })
  },
}

export const DarkMode: Story = {
  beforeEach() {
    mocked(useThemeMode).mockReturnValue({ isDark: true, toggleTheme: fn() })
  },
}
