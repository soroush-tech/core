import { useState } from 'react'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  system,
  variant as styledVariant,
} from '../index'
import { Flex, type FlexProps } from '../Flex'

export type AvatarVariant = 'circular' | 'rounded' | 'square'
export type AvatarSize = keyof Theme['avatar']
export type AvatarRingColor = keyof Theme['border']
export type AvatarRingWidth = keyof Theme['borderWidths']

type OmittedProps = 'p' | 'pt' | 'pr' | 'pb' | 'pl' | 'px' | 'py' | 'size'

export interface AvatarProps extends Omit<FlexProps, OmittedProps> {
  src?: string
  srcSet?: string
  alt?: string
  /** Fallback image URL shown when src/srcSet fail. Children are shown when all sources fail. */
  fallback?: string
  /** Shape of the avatar. Default: 'circular'. */
  variant?: AvatarVariant
  /** Preset size — resolves against theme.avatar. Default: 'md'. */
  size?: AvatarSize
  /** Adds a CSS outline ring around the avatar. */
  ring?: boolean
  /** Ring color — resolves against theme.border. */
  ringColor?: AvatarRingColor
  /** Ring width — resolves against theme.borderWidths. */
  ringWidth?: AvatarRingWidth
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'variant',
  'size',
  'ring',
  'ringColor',
  'ringWidth',
])

// size → theme.avatar scale → width + height
const avatarSizeSystem = system({
  size: { properties: ['width', 'height'], scale: 'avatar' },
})

// circular → 50%  /  rounded → theme.radii.md  /  square → 0
const avatarVariants = styledVariant({
  prop: 'variant',
  variants: {
    circular: { borderRadius: '50%' },
    rounded: { borderRadius: 'md' },
    square: { borderRadius: 0 },
  },
})

// ringColor → theme.border  /  ringWidth → theme.borderWidths
const ringSystem = system({
  ringColor: { property: 'outlineColor', scale: 'border' },
  ringWidth: { property: 'outlineWidth', scale: 'borderWidths' },
})

const AvatarRoot = styled(Flex, { label: 'avatar', shouldForwardProp })<AvatarProps>(
  {
    overflow: 'hidden',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  avatarSizeSystem,
  avatarVariants,
  ({ ring }: AvatarProps) => (ring ? { outlineStyle: 'solid', outlineOffset: '2px' } : {}),
  ringSystem
)

// Plain img fills the container — no styled-system props needed.
const AvatarImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})

export function Avatar({
  src,
  srcSet,
  alt,
  fallback,
  children,
  variant = 'circular',
  size = 'md',
  ring,
  ringColor = 'primary',
  ringWidth = 'thin',
  ...rest
}: Readonly<AvatarProps>) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [prevSrcSet, setPrevSrcSet] = useState(srcSet)
  const [prevFallback, setPrevFallback] = useState(fallback)
  const [failed, setFailed] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  if (prevSrc !== src || prevSrcSet !== srcSet || prevFallback !== fallback) {
    setPrevSrc(src)
    setPrevSrcSet(srcSet)
    setPrevFallback(fallback)
    setFailed(false)
    setUseFallback(false)
  }

  const hasPrimary = !!(src || srcSet)
  const hasAnyImage = hasPrimary || !!fallback

  const handleError = () => {
    // Switch to fallback only when a primary source existed and fallback hasn't been tried yet.
    // If fallback was the only source it was already rendered as src — go straight to failed
    // (1 error → children).
    if (!useFallback && fallback && hasPrimary) {
      setUseFallback(true)
    } else {
      setFailed(true)
    }
  }

  // When only fallback is provided (no src/srcSet), pass it as src so a single error shows children.
  const srcFallback = srcSet ? undefined : fallback
  const currentSrc = useFallback ? fallback : (src ?? srcFallback)
  const currentSrcSet = useFallback ? undefined : srcSet

  return (
    <AvatarRoot
      variant={variant}
      size={size}
      ring={ring}
      ringColor={ring ? ringColor : undefined}
      ringWidth={ring ? ringWidth : undefined}
      {...rest}
    >
      {hasAnyImage && !failed ? (
        <AvatarImg src={currentSrc} srcSet={currentSrcSet} alt={alt} onError={handleError} />
      ) : (
        children
      )}
    </AvatarRoot>
  )
}
