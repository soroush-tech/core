import type { GraphNode, LinkKind, RawLink } from 'src/common/NetworkGraph'

/** Structural shape the builder consumes. The authored `TechNode` - whose fields are
 *  narrowed to the id enums to guard against typos - is a strict subtype of this. */
export interface GraphInputNode {
  id: string
  title?: string
  size?: number
  /** Level: `area` (top-level, a show/hide toggle), `group` (a drawn label node), or
   *  `node` (a tech). */
  kind: 'area' | 'group' | 'node'
  /** Area tags - gate show/hide only, **no line drawn**. A node with its own `area`
   *  *overrides* the tags it would inherit from its parents; with none, it follows its
   *  parents' tags. */
  area?: string[]
  /** Parent attachments - the drawn containment line. A parent may be a node (e.g. Redux
   *  under React), an *area* (the line that used to come from `area`), or `rootId` (an
   *  area hanging off the central root, materialized only when referenced). A node's gate
   *  flows in from its parents unless it sets its own `area`. */
  parent?: string[]
  /** Categorical label nodes (a group, or a node acting as one) - each draws a dotted
   *  group→member line. */
  groups?: string[]
  /** Lateral associations to other nodes (dashed). */
  relations?: string[]
  legacy?: boolean
  /** Auto-expand one level: when an area reveals this node, its direct children show
   *  too without a click (still collapsible). */
  featured?: boolean
}

export interface DerivedGraph {
  nodes: GraphNode[]
  links: RawLink[]
  branchIds: Set<string>
  topLevelIds: string[]
  childrenByParent: Map<string, string[]>
  titleById: Map<string, string>
  optionalIds: Set<string>
  featuredIds: Set<string>
  relationAnchoredIds: Set<string>
  areasByNode: Map<string, string[]>
}

/** Index the flat node list by id, rejecting a duplicate id or a collision with `rootId`. */
function indexById(nodeList: GraphInputNode[], rootId: string): Map<string, GraphInputNode> {
  const byId = new Map<string, GraphInputNode>()
  for (const n of nodeList) {
    if (n.id === rootId) throw new Error(`Node id "${n.id}" collides with rootId`)
    if (byId.has(n.id)) throw new Error(`Duplicate node id: "${n.id}"`)
    byId.set(n.id, n)
  }
  return byId
}

// A node needs *some* way onto the screen: an area, a parent, or - for a relation-anchored
// (floating) node - at least one relation it can ride along.
function assertHasAnchor(n: GraphInputNode): void {
  if (
    n.kind === 'node' &&
    !((n.area?.length ?? 0) + (n.parent?.length ?? 0) + (n.relations?.length ?? 0))
  )
    throw new Error(`Node "${n.id}" has no area, parent, or relation - it would never be drawn`)
}

function assertAreaRefs(n: GraphInputNode, byId: Map<string, GraphInputNode>): void {
  for (const a of n.area ?? []) {
    if (!byId.has(a)) throw new Error(`Node "${n.id}" references unknown area "${a}"`)
    if (byId.get(a)?.kind !== 'area')
      throw new Error(`Node "${n.id}" lists non-area "${a}" in area`)
  }
}

function assertParentRefs(
  n: GraphInputNode,
  byId: Map<string, GraphInputNode>,
  rootId: string
): void {
  for (const p of n.parent ?? []) {
    if (p === rootId) continue // the central root - a valid containment parent for areas
    if (!byId.has(p)) throw new Error(`Node "${n.id}" references unknown parent "${p}"`)
    if (byId.get(p)?.kind === 'group')
      throw new Error(`Node "${n.id}" lists a group "${p}" as a parent`)
  }
}

function assertGroupRefs(n: GraphInputNode, byId: Map<string, GraphInputNode>): void {
  for (const g of n.groups ?? []) {
    if (!byId.has(g)) throw new Error(`Node "${n.id}" references unknown group "${g}"`)
    if (byId.get(g)?.kind === 'area')
      throw new Error(`Node "${n.id}" lists an area "${g}" in groups`)
  }
}

function assertRelationRefs(n: GraphInputNode, byId: Map<string, GraphInputNode>): void {
  for (const r of n.relations ?? []) {
    if (r === n.id) throw new Error(`Node "${n.id}" relates to itself`)
    if (!byId.has(r)) throw new Error(`Node "${n.id}" references unknown relation "${r}"`)
  }
}

/** Validate every node's references + per-kind shape, throwing on the first problem. */
function validateReferences(
  nodeList: GraphInputNode[],
  byId: Map<string, GraphInputNode>,
  rootId: string
): void {
  for (const n of nodeList) {
    assertHasAnchor(n)
    assertAreaRefs(n, byId)
    assertParentRefs(n, byId, rootId)
    assertGroupRefs(n, byId)
    assertRelationRefs(n, byId)
  }
}

// Build edges: parent→node (the tree), group→member, relation. `area` is a gate-only tag
// and draws no line.
function buildAllLinks(nodeList: GraphInputNode[]): RawLink[] {
  const allLinks: RawLink[] = []
  for (const n of nodeList) {
    for (const p of n.parent ?? []) allLinks.push({ source: p, target: n.id })
    for (const g of n.groups ?? [])
      allLinks.push({ source: g, target: n.id, kind: 'group' satisfies LinkKind })
    for (const r of n.relations ?? [])
      allLinks.push({ source: n.id, target: r, kind: 'relation' satisfies LinkKind })
  }
  return allLinks
}

// Label-only groups with a single member: a `kind: 'group'` node that labels just one node
// adds no grouping, so hide it and its lone spoke.
function findDroppedGroups(nodeList: GraphInputNode[], allLinks: RawLink[]): Set<string> {
  const groupMembers = new Map<string, number>()
  for (const l of allLinks)
    if (l.kind === 'group') groupMembers.set(l.source, (groupMembers.get(l.source) ?? 0) + 1)
  const droppedGroupIds = new Set<string>()
  for (const n of nodeList)
    if (n.kind === 'group' && (groupMembers.get(n.id) ?? 0) <= 1) droppedGroupIds.add(n.id)
  return droppedGroupIds
}

// Containment adjacency (group + relation edges excluded). The root keeps its area children
// in `childrenByParent` (so the renderer can detect root mode), but it is not a `branchId` -
// it stays pinned at the centre, not a clickable category.
function buildContainment(
  links: RawLink[],
  rootId: string
): { branchIds: Set<string>; childrenByParent: Map<string, string[]> } {
  const branchIds = new Set<string>()
  const childrenByParent = new Map<string, string[]>()
  for (const { source, target, kind } of links) {
    if (kind !== undefined) continue
    if (source !== rootId) branchIds.add(source)
    const kids = childrenByParent.get(source) ?? []
    kids.push(target)
    childrenByParent.set(source, kids)
  }
  return { branchIds, childrenByParent }
}

// Relation-anchored (floating) nodes: a tech node with no containment parent but with
// relations. It has no place in the containment tree - it rides along its relations,
// appearing whenever a node it relates to is visible - so it is exempt from the reachability
// check below. (An `area`, if present, just keeps it near that hub.)
function findRelationAnchored(nodeList: GraphInputNode[]): Set<string> {
  return new Set(
    nodeList
      .filter((n) => n.kind === 'node' && !n.parent?.length && n.relations?.length)
      .map((n) => n.id)
  )
}

/** Breadth-first set of ids reachable from the areas through containment edges. */
function collectReachable(
  topLevelIds: string[],
  childrenByParent: Map<string, string[]>
): Set<string> {
  const reachable = new Set<string>(topLevelIds)
  const queue = [...topLevelIds]
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const child of childrenByParent.get(id) ?? [])
      if (!reachable.has(child)) {
        reachable.add(child)
        queue.push(child)
      }
  }
  return reachable
}

// Every non-floating tech node must hang off an area through containment.
function assertReachable(
  nodeList: GraphInputNode[],
  reachable: Set<string>,
  relationAnchoredIds: Set<string>
): void {
  for (const n of nodeList)
    if (n.kind === 'node' && !relationAnchoredIds.has(n.id) && !reachable.has(n.id))
      throw new Error(`Node "${n.id}" is not reachable from an area`)
}

// Area gate per node: its own `area` tags override; otherwise inherit the union of its
// parents' gates. Returns a memoized resolver.
function makeGateOf(byId: Map<string, GraphInputNode>): (id: string) => string[] {
  const gateCache = new Map<string, string[]>()
  const gateOf = (id: string, seen: Set<string> = new Set()): string[] => {
    const n = byId.get(id)
    if (!n) return []
    if (n.kind === 'area') return [id]
    if (gateCache.has(id)) return gateCache.get(id)!
    if (seen.has(id)) return []
    seen.add(id)
    let result: string[]
    if (n.area?.length) {
      result = [...new Set(n.area)] // own tags override inherited ones
    } else {
      const set = new Set<string>()
      for (const p of n.parent ?? []) for (const a of gateOf(p, seen)) set.add(a)
      result = [...set]
    }
    gateCache.set(id, result)
    return result
  }
  return gateOf
}

interface MaterializedNodes {
  nodes: GraphNode[]
  titleById: Map<string, string>
  optionalIds: Set<string>
  featuredIds: Set<string>
  areasByNode: Map<string, string[]>
}

/** Drawn size: an explicit `size` wins; otherwise areas (top level) are largest, groups
 *  medium, and tech nodes smallest. */
function resolveSize(n: GraphInputNode, isTop: boolean): number {
  if (n.size !== undefined) return n.size
  if (isTop) return 25
  if (n.kind === 'group') return 18
  return 10
}

// Materialize drawn nodes: optional root + areas + groups + tech nodes. The root exists only
// when an area attaches to it; it is pinned at the centre.
function materialize(
  nodeList: GraphInputNode[],
  rootId: string,
  topLevelIds: string[],
  droppedGroupIds: Set<string>,
  gateOf: (id: string) => string[]
): MaterializedNodes {
  const hasRoot = nodeList.some((n) => n.parent?.includes(rootId))
  const topLevel = new Set(topLevelIds)
  const nodes: GraphNode[] = hasRoot ? [{ id: rootId, title: rootId, group: 0, size: 40 }] : []
  const titleById = new Map<string, string>(hasRoot ? [[rootId, rootId]] : [])
  const optionalIds = new Set<string>()
  const featuredIds = new Set<string>()
  const areasByNode = new Map<string, string[]>()
  for (const n of nodeList) {
    if (droppedGroupIds.has(n.id)) continue // single-member group - not drawn
    const title = n.title ?? n.id
    const isTop = topLevel.has(n.id)
    const size = resolveSize(n, isTop)
    const group = isTop ? topLevelIds.indexOf(n.id) + 1 : 0
    nodes.push({ id: n.id, title, group, size })
    titleById.set(n.id, title)
    if (n.legacy) optionalIds.add(n.id)
    if (n.featured) featuredIds.add(n.id)
    if (n.kind === 'node') areasByNode.set(n.id, gateOf(n.id))
  }
  return { nodes, titleById, optionalIds, featuredIds, areasByNode }
}

/** Materialize the flat authored nodes into a render graph.
 *
 *  Areas are the top level. The only drawn containment line is `parent` - a node hangs
 *  off each parent, which may be a node, an area, or `rootId`. `area` is a gate-only tag
 *  (no line): a node with its own `area` overrides the tags inherited from its parents,
 *  otherwise it follows them. A `group` is a drawn node linked to its members by a dotted
 *  edge (a group labelling a single member is dropped - it adds no grouping), and
 *  `relations` are lateral edges. Areas may list `rootId` as a parent to hang
 *  off a central root node - materialized only when referenced, so the same data toggles
 *  between a root-centred and a free-floating layout.
 *
 *  Strict: a duplicate id, unknown/wrong-kind reference, a node with neither area nor
 *  parent, or a node unreachable from an area throws at `pnpm gen:experienceGraph`. */
export function buildGraph(nodeList: GraphInputNode[], rootId: string): DerivedGraph {
  const byId = indexById(nodeList, rootId)
  validateReferences(nodeList, byId, rootId)

  const allLinks = buildAllLinks(nodeList)
  const droppedGroupIds = findDroppedGroups(nodeList, allLinks)
  const links = allLinks.filter((l) => !(l.kind === 'group' && droppedGroupIds.has(l.source)))

  const { branchIds, childrenByParent } = buildContainment(links, rootId)
  const topLevelIds = nodeList.filter((n) => n.kind === 'area').map((n) => n.id)
  const relationAnchoredIds = findRelationAnchored(nodeList)

  const reachable = collectReachable(topLevelIds, childrenByParent)
  assertReachable(nodeList, reachable, relationAnchoredIds)

  const gateOf = makeGateOf(byId)
  const { nodes, titleById, optionalIds, featuredIds, areasByNode } = materialize(
    nodeList,
    rootId,
    topLevelIds,
    droppedGroupIds,
    gateOf
  )

  return {
    nodes,
    links,
    branchIds,
    topLevelIds,
    childrenByParent,
    titleById,
    optionalIds,
    featuredIds,
    relationAnchoredIds,
    areasByNode,
  }
}
