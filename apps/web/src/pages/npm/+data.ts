import type { PageContext } from 'vike/types'
import { pageSocialMeta, type HeadMeta } from 'src/renderer/head'

export function data(pageContext: PageContext): HeadMeta {
  return { meta: pageSocialMeta(pageContext) }
}
