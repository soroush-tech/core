import { type ReactNode } from 'react'
import { styled, type Theme, type CSSObject } from '../index'
import { Paper, type PaperProps } from '../Paper'
import { Typography, type TypographyProps } from '../Typography'
import { Icon, type IconName, type IconProps } from '../Icon'

export type CardVariant = 'paper' | 'bracketBox' | 'interactive'

// Per-variant CSS that styled-system props can't express. Raw theme function so
// theme tokens resolve directly and the styling is gated on `variant`.
const variantStyle = ({ theme, variant }: { theme?: Theme; variant?: CardVariant }): CSSObject => {
  // bracketBox: square top-left / bottom-right corners with bracket pseudo-elements.
  if (variant === 'bracketBox') {
    const corner = `2px solid ${theme?.border.primary}`
    const size = theme?.space[1]
    return {
      position: 'relative',
      borderTopLeftRadius: 0,
      borderBottomRightRadius: 0,
      '&::before, &::after': { content: '""', position: 'absolute', width: size, height: size },
      '&::before': { top: 0, left: 0, borderTop: corner, borderLeft: corner },
      '&::after': { bottom: 0, right: 0, borderBottom: corner, borderRight: corner },
    }
  }
  // interactive: hover fills the surface with the secondary background.
  if (variant === 'interactive') {
    return {
      '&:hover': { backgroundColor: theme?.background.secondary },
    }
  }
  return {}
}

const CardSurface = styled(Paper, { label: 'CardSurface' })<{ variant?: CardVariant }>(variantStyle)

export interface CardProps extends Omit<PaperProps, 'title'> {
  variant?: CardVariant
  icon?: IconName
  title?: string | ReactNode
  caption?: string
  iconProps?: Omit<IconProps, 'name'>
  titleProps?: Omit<TypographyProps, 'children'>
  captionProps?: Omit<TypographyProps, 'children'>
}

export function Card({
  variant = 'paper',
  icon,
  title,
  caption,
  iconProps,
  titleProps,
  captionProps,
  flexDirection = 'column',
  children,
  ...rest
}: Readonly<CardProps>) {
  return (
    <CardSurface variant={variant} flexDirection={flexDirection} {...rest}>
      {icon !== undefined && <Icon name={icon} {...iconProps} />}
      {title !== undefined &&
        (typeof title === 'string' ? (
          <Typography variant="overline" color="primary" fontFamily="mono" mb={1} {...titleProps}>
            {title}
          </Typography>
        ) : (
          title
        ))}
      {caption !== undefined && (
        <Typography variant="caption" color="secondary" mb={5} {...captionProps}>
          {caption}
        </Typography>
      )}
      {children}
    </CardSurface>
  )
}
