import { useState } from 'react'
import { useTheme } from '@emotion/react'
import SunIcon from 'src/assets/sun.svg?react'
import MoonIcon from 'src/assets/moon.svg?react'
import { styled } from 'src/theme'
import { AppBar, type AppBarPosition } from 'src/theme/AppBar'
import { View } from 'src/theme/View'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { Switch } from 'src/theme/Switch'
import { Button } from 'src/theme/Button'
import { Icon } from 'src/theme/Icon'
import { Drawer } from 'src/theme/Drawer'
import { Link } from 'src/theme/Link'
import { Logo } from 'src/common/Logo'
import { Navbar } from 'src/common/Navbar'
import { useThemeMode } from 'src/theme/hooks/useThemeMode'
import { alpha } from 'src/theme/utils'

export interface HeaderProps {
  position?: AppBarPosition
}

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/experience/', label: 'Experience' },
  { href: '/articles/', label: 'Articles' },
]

const MOBILE_BREAKPOINT = '768px'

// Inline nav for wide screens; hidden below the mobile breakpoint.
const DesktopNav = styled(View, { label: 'DesktopNav' })`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`

// Hamburger trigger; only shown below the mobile breakpoint.
const MobileMenuButton = styled(View, { label: 'MobileMenuButton' })`
  display: none;
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
  }
`

export function Header({ position = 'fixed' }: Readonly<HeaderProps>) {
  const theme = useTheme()
  const { isDark, toggleTheme } = useThemeMode()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <AppBar
      elevation={0}
      position={position}
      top={0}
      left={0}
      height="64px"
      px={6}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      color="appBar"
      blur
      borderBottom={`1px solid ${alpha(theme.border.primary, 0.2)}`}
    >
      <Flex flexDirection="row" alignItems="center" gap={2}>
        <Link href="https://soroush.tech" underline="none" display="inline-flex">
          <Logo size={48} />
        </Link>
        <Typography
          as="span"
          fontSize={2}
          fontWeight="bold"
          letterSpacing="tighter"
          color="initial"
        >
          SOROUSH™
        </Typography>
      </Flex>

      <DesktopNav>
        <Navbar
          aria-label="Main"
          items={NAV_ITEMS}
          direction="horizontal"
          gap={4}
          variant="button"
          letterSpacing="tight"
        />
      </DesktopNav>

      <Flex flexDirection="row" alignItems="center" gap={3}>
        <Flex flexDirection="row" alignItems="center" gap={2}>
          <Typography variant="caption" letterSpacing="widest" color="primary">
            MODE
          </Typography>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            variant="inside"
            color="primary"
            size="sm"
            aria-label="Toggle theme"
          />
          {isDark ? (
            <MoonIcon width={14} height={14} color={theme.text.primary} />
          ) : (
            <SunIcon width={14} height={14} color={theme.text.primary} />
          )}
        </Flex>
        <MobileMenuButton>
          <Button
            variant="text"
            size="sm"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Icon name="menu" color="initial" />
          </Button>
        </MobileMenuButton>
      </Flex>

      <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} anchor="right">
        <Flex
          flexDirection="column"
          gap={2}
          p={6}
          width="260px"
          onClick={() => setIsMenuOpen(false)}
        >
          <Navbar
            aria-label="Mobile"
            items={NAV_ITEMS}
            direction="vertical"
            gap={3}
            variant="button"
            letterSpacing="tight"
          />
        </Flex>
      </Drawer>
    </AppBar>
  )
}
