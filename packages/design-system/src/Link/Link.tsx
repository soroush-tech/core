import { type AnchorHTMLAttributes, type ComponentType, type ElementType } from 'react'
import { styled, system, type CSSObject, type Theme } from '../index'
import { Typography, type TypographyProps } from '../Typography'

export type LinkUnderline = 'always' | 'hover' | 'none'

export interface LinkProps
  extends
    Omit<TypographyProps, 'as'>,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Omit<TypographyProps, 'as'>> {
  underline?: LinkUnderline
  gap?: number | string
}

const underlineStyles: Record<LinkUnderline, CSSObject> = {
  always: { textDecoration: 'underline' },
  none: { textDecoration: 'none' },
  hover: {
    textDecoration: 'none',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '1px',
      background: 'currentColor',
      transform: 'scaleX(0)',
      transformOrigin: 'right',
      transition: 'transform 0.2s ease',
    },
    '&:hover::after': {
      transform: 'scaleX(1)',
      transformOrigin: 'left',
    },
  },
}

const linkGapSystem = system({ gap: { property: 'gap', scale: 'space' } })

const LinkBase = styled(Typography as ComponentType<LinkProps & { as?: ElementType }>, {
  shouldForwardProp: (prop) => prop !== 'underline',
})<LinkProps>(
  ({ underline = 'always' }) => underlineStyles[underline],
  ({ theme }: { theme: Theme }) => ({
    '&:hover': { color: theme.palette.primary.main },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '4px',
      borderRadius: theme.radii.sm,
    },
  }),
  linkGapSystem
)

export function Link({
  underline = 'always',
  color = 'primary',
  variant = 'inherit',
  target,
  rel,
  ...rest
}: Readonly<LinkProps>) {
  const resolvedRel = target === '_blank' && rel === undefined ? 'noopener noreferrer' : rel
  return (
    <LinkBase
      as="a"
      underline={underline}
      color={color}
      variant={variant}
      target={target}
      rel={resolvedRel}
      {...rest}
    />
  )
}
