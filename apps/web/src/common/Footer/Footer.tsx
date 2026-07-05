import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { View } from 'src/theme/View'
import { Logo } from 'src/common/Logo'
import { Flex } from 'src/theme/Flex'
import { Grid } from 'src/theme/Grid'
import { Typography } from 'src/theme/Typography'
import { Navbar } from 'src/common/Navbar'
import { Blockquote } from 'src/common/Blockquote'
import { alpha } from 'src/theme/utils'

const DIRECTORIES = [
  { href: '/design/system/', label: 'Design System' },
  { href: '/domain/', label: 'Delivery Domain' },
  { href: '/experience/', label: 'Experience Graph' },
]

const CONNECTIVITY = [
  { href: '/contact/', label: 'Contacts' },
  { href: 'https://github.com/soroush-tech', target: '_blank', label: 'GitHub Repository' },
  { href: '/npm/', label: 'NPM Packages' },
  {
    href: 'https://www.linkedin.com/in/masoud-soroush-4139b152',
    target: '_blank',
    label: 'LinkedIn',
  },

  // { href: '/wiki/', label: 'Technical Wiki' },
]

// single-side top border — View's borderColor applies to all four sides
const FooterRoot = styled(View, { label: 'FooterRoot' })`
  border-top: 1px solid ${({ theme }) => alpha(theme.border.primary, 0.1)};
`

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`

const TerminalText = styled('span', { label: 'TerminalText' })`
  display: block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes[0]}px;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  animation: ${pulseAnim} 1s ease-in-out infinite;
`

export function Footer() {
  return (
    <FooterRoot as="footer" bg="terminal" px={6} py={6}>
      <View maxWidth="1280px" mx="auto">
        <Grid
          gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
          gap={6}
        >
          {/* Col 1 — Logo + tagline (drops to the bottom in the 2-col tablet view) */}
          <View order={[0, 1, 1, 0]}>
            <Flex flexDirection="row" alignItems="center" gap={2} mb={3}>
              <Logo size={72} />
              <Typography
                as="span"
                fontSize={1}
                fontWeight="bold"
                letterSpacing="tighter"
                color="initial"
              >
                SOROUSH.TECH
              </Typography>
            </Flex>
            <Typography
              variant="caption"
              color="secondary"
              lineHeight="relaxed"
              display={['none', 'block']}
            >
              A proprietary system designed for the orchestration of high-performance digital
              environments. Built for speed, scaled for eternity.
            </Typography>
          </View>

          {/* Col 2 — Directories (internal NavLinks) */}
          <View>
            <Typography
              variant="caption"
              letterSpacing="widest"
              color="primary"
              display="block"
              mb={3}
              fontFamily="mono"
              textTransform="uppercase"
            >
              Directories
            </Typography>
            <Navbar
              aria-label="Directories"
              items={DIRECTORIES}
              direction="vertical"
              gap={2}
              variant="caption"
              underline="none"
            />
          </View>

          {/* Col 3 — Connectivity (external links) */}
          <View>
            <Typography
              variant="caption"
              letterSpacing="widest"
              color="primary"
              display="block"
              mb={3}
              fontFamily="mono"
              textTransform="uppercase"
            >
              Connectivity
            </Typography>
            <Navbar
              aria-label="Connectivity"
              items={CONNECTIVITY}
              direction="vertical"
              gap={2}
              variant="caption"
              underline="none"
            />
          </View>

          {/* Col 4 — Terminal readout + copyright (stays after the logo in tablet) */}
          <View order={[0, 2, 2, 0]}>
            <Blockquote bg="primary" p={3} mb={4} display={['none', 'block']}>
              <Typography
                variant="caption"
                color="primary"
                display="block"
                mb={1}
                fontFamily="mono"
              >
                SYSTEM_OUTPUT
              </Typography>
              <TerminalText>Running diagnostic sequence... OK</TerminalText>
            </Blockquote>
            <Typography variant="caption" color="secondary" fontFamily="mono">
              © 2026 SOROUSH.TECH. ALL RIGHTS RESERVED.
            </Typography>
          </View>
        </Grid>
      </View>
    </FooterRoot>
  )
}
