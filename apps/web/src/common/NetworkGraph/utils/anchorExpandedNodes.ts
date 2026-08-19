interface Point {
  x: number
  y: number
}

/** Maintain the soft-anchor map for expanded nodes (opened areas + expanded branches).
 *  An anchor is the spot a node was sitting when it became expanded; a gentle force
 *  later pulls it back there so it holds position yet can drift. Captured **once**,
 *  and only from a node that already has a settled position (`positions`) - a freshly
 *  revealed node has none yet, so it fans out under the forces first and is anchored on
 *  a later pass. Anchors for no-longer-expanded nodes are dropped. Mutates `anchors`. */
export function anchorExpandedNodes(
  expandedNodes: Set<string>,
  positions: Map<string, Point>,
  anchors: Map<string, Point>
): void {
  for (const id of anchors.keys()) if (!expandedNodes.has(id)) anchors.delete(id)
  for (const id of expandedNodes) {
    if (anchors.has(id)) continue // capture once - keep the spot it was opened at
    const settled = positions.get(id)
    if (settled) anchors.set(id, { x: settled.x, y: settled.y })
  }
}
