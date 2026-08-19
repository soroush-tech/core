import type { GraphLink, GraphNode } from '../NetworkGraph.types'

/** Resolve a link endpoint to its node id (links carry string ids before, and node
 *  objects after, d3-force resolves them). */
const endId = (e: GraphLink['source']) => (typeof e === 'object' ? (e as GraphNode).id : e)

/** A d3 force that softly caps how far a group member drifts from its group hub.
 *  When a member sits beyond `maxDistance` from its hub it gets an inward nudge
 *  proportional to the overshoot - a soft ceiling, not a hard snap, so motion stays
 *  smooth. Call `.links(links)` with the visible edges whenever they change (only
 *  `group`-kind links are constrained); d3 calls `.initialize(nodes)` for the lookup. */
export function forceMaxGroupDistance(maxDistance: number, strength = 1) {
  let groupLinks: GraphLink[] = []
  let nodeById = new Map<string, GraphNode>()

  const force = (alpha: number) => {
    for (const link of groupLinks) {
      const hub = nodeById.get(endId(link.source) as string)
      const member = nodeById.get(endId(link.target) as string)
      if (!hub || !member) continue
      const dx = member.x! - hub.x!
      const dy = member.y! - hub.y!
      const dist = Math.hypot(dx, dy)
      if (dist > maxDistance) {
        const pull = ((dist - maxDistance) * strength * alpha) / dist
        member.vx! -= dx * pull
        member.vy! -= dy * pull
      }
    }
  }

  force.initialize = (nodes: GraphNode[]) => {
    nodeById = new Map(nodes.map((n) => [n.id, n]))
  }

  force.links = (links: GraphLink[]) => {
    groupLinks = links.filter((l) => l.kind === 'group')
    return force
  }

  return force
}
