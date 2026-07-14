import type { CSSProperties, ReactNode } from 'react'
import styled from '@emotion/styled'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Image } from '@soroush.tech/design-system/Image'
import { Typography } from '@soroush.tech/design-system/Typography'

/** Multi-format responsive image from vite-imagetools `as=picture` imports. */
export interface Images {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

export interface DomainCardProps {
  index: number
  /** Overrides the default `#NN` corner badge (e.g. a version like `v0.2.0`). */
  badge?: string
  title: string
  description: string
  tags: string[]
  images?: Images
  imageAlt?: string
  featured?: boolean
  style?: CSSProperties
  className?: string
  /** Optional footer content rendered on the card below the tags (e.g. an action button). */
  children?: ReactNode
}

// Custom CSS: :hover pseudo-selector, img descendant selector, and bracket
// opacity override require CSS that can't be expressed as theme primitive props.
const CardRoot = styled(Card, { label: 'DomainCard' })`
  transition: background-color 0.3s;

  &::before,
  &::after {
    opacity: 0.2;
    transition: opacity 0.3s;
  }
  &:hover::before,
  &:hover::after {
    opacity: 1;
  }

  img {
    transition: filter 0.3s;
    filter: opacity(80%);
  }
  &:hover img {
    filter: opacity(100%);
  }

  &:hover {
    background-color: ${({ theme }) => theme.background.paper};
  }
`

const TagChip = styled(Typography, { label: 'TagChip' })`
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.background.paper};
`

export function DomainCard({
  index,
  badge: badgeProp,
  title,
  description,
  tags,
  images,
  imageAlt,
  featured = false,
  style,
  className,
  children,
}: Readonly<DomainCardProps>) {
  const badge = badgeProp ?? `#${String(index).padStart(2, '0')}`
  // Featured image is full-width when the card is stacked, then a fixed box once it
  // switches to a row at 52em — keep this in sync with the layout props below.
  const imageSizes = featured ? '(min-width: 52em) 480px, (min-width: 40em) 360px, 100vw' : '360px'

  return (
    <CardRoot
      variant="bracketBox"
      elevation={0}
      bg="primary"
      borderRadius="sq"
      borderWidth="thin"
      borderStyle="solid"
      borderColor="light"
      p={4}
      style={style}
      className={className}
    >
      <Typography
        variant="caption"
        color="primary"
        position="absolute"
        top={2}
        right={2}
        opacity={0.3}
      >
        {badge}
      </Typography>
      <Flex
        flexDirection={featured ? ['column', 'column', 'row'] : 'column'}
        gap={3}
        alignItems={featured ? ['stretch', 'stretch', 'center'] : undefined}
      >
        {images && (
          <Flex
            width={featured ? ['100%', '360px', '480px'] : '360px'}
            height={featured ? undefined : '360px'}
            maxWidth="100%"
            flex="none"
            alignSelf={featured ? ['center', 'center', 'auto'] : undefined}
            style={featured ? { aspectRatio: '1 / 1' } : undefined}
          >
            <picture>
              {Object.entries(images.sources).map(([format, srcSet]) => (
                <source key={format} srcSet={srcSet} type={`image/${format}`} sizes={imageSizes} />
              ))}
              <Image
                src={images.img.src}
                sizes={imageSizes}
                objectFit="contain"
                width="100%"
                height="100%"
                fetchPriority={featured ? 'high' : 'auto'}
                alt={imageAlt ?? ''}
              />
            </picture>
          </Flex>
        )}
        <Flex flex={featured ? ['0 1 auto', '0 1 auto', '1'] : undefined}>
          <Typography
            as="h2"
            fontSize={featured ? 4 : 3}
            fontWeight={featured ? 'black' : 'bold'}
            color="primary"
            mb={3}
            lineHeight="tight"
            letterSpacing="tight"
            style={{ whiteSpace: 'pre-line' }}
          >
            {title}
          </Typography>
          <Typography
            variant={featured ? 'body1' : 'body2'}
            color="secondary"
            mb={3}
            lineHeight="relaxed"
          >
            {description}
          </Typography>
          <Flex flexDirection="row" flexWrap="wrap" gap={1}>
            {tags.map((tag) => (
              <TagChip key={tag} variant="caption" as="span" color="primary" opacity={0.7}>
                {tag}
              </TagChip>
            ))}
          </Flex>
          {children && <Flex mt={4}>{children}</Flex>}
        </Flex>
      </Flex>
    </CardRoot>
  )
}
