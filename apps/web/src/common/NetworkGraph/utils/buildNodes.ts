import type { GraphNode, RawLink } from '../NetworkGraph.types'
import { AREA_RING_RADIUS, VIEW_SIZE } from '../const'

const CENTER = VIEW_SIZE / 2

/** Reuse saved positions so existing nodes don't jump; new nodes spawn at their
 *  anchor. The root is pinned at the centre. A node the viewer has dragged is in
 *  `pinned`, so it stays fixed where it was dropped. In a root-less graph the areas
 *  (top-level hubs, `group > 0`) are force-positioned - seeded on a ring so they don't
 *  start coincident - and the force layout (their area↔area relations) arranges them. */
export function buildNodes(
  nodes: GraphNode[],
  links: RawLink[],
  rootId: string,
  visibleIds: Set<string>,
  positions: Map<string, { x: number; y: number }>,
  pinned: Map<string, { x: number; y: number }> = new Map()
): GraphNode[] {
  const hasRoot = nodes.some((n) => n.id === rootId)
  const areaIds = hasRoot ? [] : nodes.filter((n) => n.group > 0).map((n) => n.id)

  return nodes
    .filter((n) => visibleIds.has(n.id))
    .map((n) => {
      if (n.id === rootId) return { ...n, x: CENTER, y: CENTER, fx: CENTER, fy: CENTER }

      const pin = pinned.get(n.id)
      if (pin) return { ...n, x: pin.x, y: pin.y, fx: pin.x, fy: pin.y } // dragged ⇒ fixed

      if (!hasRoot && n.group > 0) {
        const saved = positions.get(n.id)
        if (saved) return { ...n, x: saved.x, y: saved.y } // continue from where it settled
        const angle = (areaIds.indexOf(n.id) / areaIds.length) * 2 * Math.PI
        return {
          ...n,
          x: CENTER + AREA_RING_RADIUS * Math.cos(angle),
          y: CENTER + AREA_RING_RADIUS * Math.sin(angle),
        }
      }

      const saved = positions.get(n.id)
      if (saved) return { ...n, x: saved.x, y: saved.y }
      // Spawn at an anchor: a tech node's containment parent, or - for a group node,
      // which has only outgoing group links - one of its members. A relation-anchored
      // (floating) node has neither, so it falls back to a relation neighbour that is
      // already placed, easing in beside it instead of from the centre.
      const parent = links.find((l) => l.target === n.id && l.kind === undefined)
      const member = links.find((l) => l.source === n.id && l.kind === 'group')
      const relation = links.find(
        (l) =>
          l.kind === 'relation' &&
          (l.source === n.id || l.target === n.id) &&
          positions.has((l.source === n.id ? l.target : l.source) as string)
      )
      const relationNeighbor =
        relation && (relation.source === n.id ? relation.target : relation.source)
      const anchorId = parent ? parent.source : (member?.target ?? relationNeighbor)
      const anchorPos = anchorId ? positions.get(anchorId as string) : undefined
      return { ...n, x: anchorPos?.x ?? CENTER, y: anchorPos?.y ?? CENTER }
    })
}
