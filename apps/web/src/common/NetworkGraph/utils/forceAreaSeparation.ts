import type { GraphNode } from '../NetworkGraph.types'

export interface AreaSeparationOptions {
  /** Circle radius of an area with no visible children. */
  radiusBase: number
  /** Extra radius per visible child - more children ⇒ a wider disk. */
  radiusPerChild: number
  /** How far one shared node lets two circles overlap (shrinks the gap they keep). */
  sharedAllowance: number
  /** Separation stiffness. */
  strength: number
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/** A d3 force that treats every area as the centre of a circle whose radius grows
 *  with its visible child count, then pushes any two area centres apart until their
 *  circles only just touch. Nodes shared by both areas shrink the gap the pair keeps
 *  (`sharedAllowance` each), so circles overlap exactly where tech is shared and stay
 *  apart otherwise. Call `.config(areaIds, areasByNode)` whenever the graph changes;
 *  d3 calls `.initialize(nodes)` to size the circles from the visible nodes. */
export function forceAreaSeparation(opts: AreaSeparationOptions) {
  let areaIds = new Set<string>()
  let areasByNode = new Map<string, string[]>()
  let areaNodes: GraphNode[] = []
  let radiusById = new Map<string, number>()
  let sharedByPair = new Map<string, number>()

  const force = (alpha: number) => {
    for (let i = 0; i < areaNodes.length; i++) {
      for (let j = i + 1; j < areaNodes.length; j++) {
        const a = areaNodes[i]
        const b = areaNodes[j]
        const shared = sharedByPair.get(pairKey(a.id, b.id)) ?? 0
        const need = radiusById.get(a.id)! + radiusById.get(b.id)! - shared * opts.sharedAllowance
        let dx = b.x! - a.x!
        let dy = b.y! - a.y!
        let dist = Math.hypot(dx, dy)
        if (dist === 0) {
          dx = 1 // coincident centres - separate along an arbitrary axis
          dy = 0
          dist = 1
        }
        if (dist >= need) continue
        const push = ((need - dist) * opts.strength * alpha) / dist / 2 // half to each
        a.vx! -= dx * push
        a.vy! -= dy * push
        b.vx! += dx * push
        b.vy! += dy * push
      }
    }
  }

  force.initialize = (nodes: GraphNode[]) => {
    areaNodes = nodes.filter((n) => areaIds.has(n.id))
    const childCount = new Map<string, number>()
    const shared = new Map<string, number>()
    for (const n of nodes) {
      const gate = areasByNode.get(n.id)
      if (!gate) continue
      const areas = gate.filter((a) => areaIds.has(a))
      for (const a of areas) childCount.set(a, (childCount.get(a) ?? 0) + 1)
      for (let i = 0; i < areas.length; i++)
        for (let j = i + 1; j < areas.length; j++) {
          const key = pairKey(areas[i], areas[j])
          shared.set(key, (shared.get(key) ?? 0) + 1)
        }
    }
    radiusById = new Map(
      areaNodes.map((a) => [
        a.id,
        opts.radiusBase + opts.radiusPerChild * (childCount.get(a.id) ?? 0),
      ])
    )
    sharedByPair = shared
  }

  force.config = (ids: string[], gates: Map<string, string[]>) => {
    areaIds = new Set(ids)
    areasByNode = gates
    return force
  }

  return force
}
