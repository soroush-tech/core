import type { GraphLink, GraphNode } from '../NetworkGraph.types'
import {
  AREA_RELATION_DISTANCE,
  AREA_RELATION_STRENGTH,
  CONTAINMENT_STRENGTH,
  GROUP_DISTANCE,
  GROUP_STRENGTH,
  LINK_DISTANCE,
  RELATION_DISTANCE,
  RELATION_STRENGTH,
} from '../const'

/** A resolved link endpoint that is an area hub (group > 0). */
const isAreaEnd = (e: GraphLink['source']) => typeof e === 'object' && (e as GraphNode).group > 0
/** True when both ends of a link are area hubs (an area↔area relation). */
export const areaToArea = (d: GraphLink) => isAreaEnd(d.source) && isAreaEnd(d.target)

/** Per-kind link distance - area↔area relations stretch widest, group hubs pull close. */
export const linkDistance = (d: GraphLink) => {
  if (d.kind === 'relation') return areaToArea(d) ? AREA_RELATION_DISTANCE : RELATION_DISTANCE
  if (d.kind === 'group') return GROUP_DISTANCE
  return LINK_DISTANCE
}

/** Per-kind link stiffness - relations pull gently, group + containment hold firm. */
export const linkStrength = (d: GraphLink) => {
  if (d.kind === 'relation') return areaToArea(d) ? AREA_RELATION_STRENGTH : RELATION_STRENGTH
  if (d.kind === 'group') return GROUP_STRENGTH
  return CONTAINMENT_STRENGTH
}

/** Per-kind CSS class - area↔area relations get their own heavier "backbone" style. */
export const linkClass = (d: GraphLink) => {
  if (d.kind === 'relation') return areaToArea(d) ? 'link is-area-relation' : 'link is-relation'
  if (d.kind === 'group') return 'link is-group'
  return 'link'
}
