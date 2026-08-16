import type { PageContext } from 'vike/types'
import { SITE_URL } from 'src/config'
import { SITE_NAME, pageTitle, pageDescription } from './seo'

/** A single `<meta>` tag, keyed by either `name` or `property`. */
export type MetaTag = { name: string; content: string } | { property: string; content: string }

/** An imagetools `?as=picture` import - the bits needed for og:image + its dimensions. */
export interface Picture {
  img: { src: string; w: number; h: number }
}

/**
 * Per-page head metadata returned by a page's `+data.ts`. `buildHead` renders `meta` generically
 * and `jsonLd` as a script tag; `title`/`description` are also read by the article `+title`/
 * `+description` hooks. The mechanical tags (title, canonical, CSP, robots) stay in `buildHead`.
 */
export interface HeadMeta {
  title?: string
  description?: string
  meta?: MetaTag[]
  jsonLd?: object
}

interface SocialMetaInput {
  title: string
  description?: string
  /** imagetools `?as=picture` import - yields og:image (absolute) + og:image:width/height. */
  image?: Picture
  type?: 'website' | 'article'
}

/**
 * Open Graph / Twitter social meta tags for a page. The canonical `<meta name="description">`
 * is emitted by buildHead from the page's config (symmetric with the document title).
 */
export const socialMeta = ({
  title,
  description,
  image,
  type = 'website',
}: SocialMetaInput): MetaTag[] => {
  const tags: MetaTag[] = [
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
  ]
  if (description)
    tags.push(
      { property: 'og:description', content: description },
      { name: 'twitter:description', content: description }
    )
  if (image) {
    const url = `${SITE_URL}${image.img.src}`
    tags.push(
      { property: 'og:image', content: url },
      { property: 'og:image:width', content: String(image.img.w) },
      { property: 'og:image:height', content: String(image.img.h) },
      { name: 'twitter:image', content: url }
    )
  }
  return tags
}

/** `socialMeta` for a standard page, sourcing title/description from its config. */
export const pageSocialMeta = (pageContext: PageContext, image?: Picture): MetaTag[] =>
  socialMeta({
    title: pageTitle(pageContext) ?? SITE_NAME,
    description: pageDescription(pageContext),
    image,
  })
