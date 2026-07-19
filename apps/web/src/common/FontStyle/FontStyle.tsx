import { styled, type Theme } from '@soroush.tech/design-system'
import { useTheme } from '@soroush.tech/design-system/theme'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Paper } from '@soroush.tech/design-system/Paper'

export interface FontStyleProps {
  variant?: keyof Theme['fonts']
  text?: string
}

// 5rem display size and weight 300 have no theme token equivalents
const FontDisplay = styled(Typography, { label: 'FontDisplay' })`
  font-size: 5rem;
  line-height: 1.2;
  font-weight: 300;
  white-space: pre-line;
`

function extractFontName(fontFamily: string): string {
  return fontFamily.split(',')[0].replace(/['"]/g, '').trim()
}

export function FontStyle({ variant = 'body', text = 'Aa' }: Readonly<FontStyleProps>) {
  const theme = useTheme()
  const displayName = extractFontName(theme.fonts[variant])

  return (
    <Paper p={5} bg="primary" borderRadius="md" flex="1" display="flex" flexDirection="column">
      <Flex flexDirection="row" justifyContent="space-between" mb={4}>
        <Typography variant="caption" color="secondary" fontFamily="mono">
          {variant.toUpperCase()}
        </Typography>
        <Typography variant="caption" color="secondary" fontFamily="mono" opacity={0.5}>
          {displayName}
        </Typography>
      </Flex>
      <Flex flex="1" alignItems="center" justifyContent="center">
        <FontDisplay as="div" fontFamily={variant} color="initial">
          {text}
        </FontDisplay>
      </Flex>
    </Paper>
  )
}
