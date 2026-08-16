import { useCallback, useMemo, useState } from 'react'
import type { GraphData } from '../NetworkGraph.types'
import { computeVisibleIds } from '../utils/computeVisibleIds'
import { toggleSet } from '../utils/toggleSet'

/**
 * Group and relation-anchored (floating) nodes sit outside the expand tree, so
 * `computeVisibleIds` never reaches them. A group node rides along whenever a member it
 * links to is visible; a relation-anchored node rides along whenever a node it relates to
 * is visible - so their group/relation edge then renders. Mutates `visible` in place.
 */
function addOutsideTreeNodes(visible: Set<string>, data: GraphData): void {
  for (const link of data.links) {
    if (link.kind === 'group' && visible.has(link.target)) visible.add(link.source)
  }
  if (data.relationAnchoredIds.size === 0) return
  for (const link of data.links) {
    if (link.kind !== 'relation') continue
    if (data.relationAnchoredIds.has(link.source) && visible.has(link.target))
      visible.add(link.source)
    else if (data.relationAnchoredIds.has(link.target) && visible.has(link.source))
      visible.add(link.target)
  }
}

/** Owns the graph's interactive UI state: the active (hovered) node and the
 *  expand/collapse set, plus the visible-node set derived from it. */
export function useGraphState(data: GraphData) {
  const [activeNode, setActiveNode] = useState(data.rootId)
  // Start with only featured nodes pre-expanded: areas are still deactivated, so the
  // graph opens collapsed, but once an area reveals a featured node its direct children
  // ride along (one level) without a click. The viewer can still collapse it.
  const [expandedNodes, setExpandedNodes] = useState(() => new Set(data.featuredIds))
  // Optional nodes (e.g. legacy) start hidden; the consumer's toggle reveals them.
  const [showOptional, setShowOptional] = useState(false)

  const visibleIds = useMemo(() => {
    const hiddenIds = showOptional ? undefined : data.optionalIds
    const visible = computeVisibleIds(
      expandedNodes,
      data.rootId,
      data.childrenByParent,
      data.topLevelIds,
      hiddenIds,
      data.areasByNode
    )
    addOutsideTreeNodes(visible, data)
    return visible
  }, [expandedNodes, showOptional, data])

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => toggleSet(prev, id))
  }, [])

  const toggleOptional = useCallback(() => setShowOptional((prev) => !prev), [])

  return {
    activeNode,
    setActiveNode,
    expandedNodes,
    toggleNode,
    visibleIds,
    showOptional,
    toggleOptional,
    hasOptional: data.optionalIds.size > 0,
  }
}
