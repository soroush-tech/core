import { type ReactNode } from 'react'
import { Card } from '@soroush.tech/design-system/Card'
import { Typography } from '@soroush.tech/design-system/Typography'
import { type IconName } from '@soroush.tech/design-system/Icon'

export interface IconCardProps {
  /** Icon registry name shown at the top of the card. */
  icon: IconName
  /** Card heading — rendered as an uppercase level-3 heading. */
  title: string
  /** Body copy rendered under the title. */
  body: string
  /** Optional extra content rendered after the body (e.g. a tag or meta line). */
  children?: ReactNode
}

/**
 * @description Shared icon + title + body card used across the about-page sections.
 * Built on `Card`'s `interactive` variant with a fixed look.
 */
export function IconCard({ icon, title, body, children }: Readonly<IconCardProps>) {
  return (
    <Card
      variant="interactive"
      icon={icon}
      iconProps={{ color: 'primary', size: '2.25rem' }}
      title={title}
      titleProps={{
        variant: 'h4',
        as: 'h3',
        color: 'initial',
        fontFamily: 'body',
        textTransform: 'uppercase',
        letterSpacing: 'tight',
      }}
      elevation={0}
      bg="paper"
      p={4}
      gap={3}
      borderColor="light"
      borderWidth="thin"
      borderStyle="solid"
      transition="background-color 0.2s ease"
    >
      <Typography variant="body2" color="secondary" lineHeight="relaxed">
        {body}
      </Typography>
      {children}
    </Card>
  )
}
