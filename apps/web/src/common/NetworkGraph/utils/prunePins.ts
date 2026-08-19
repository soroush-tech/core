interface Point {
  x: number
  y: number
}

/** Drop drag-pins for nodes that are no longer visible - e.g. when an area is
 *  collapsed its members hide, so their pins are cleared and reopening reflows them
 *  fresh instead of snapping back to where they were dropped. Area hubs stay visible
 *  even when closed, so their pins persist. Mutates `pinned`. */
export function prunePins(pinned: Map<string, Point>, visibleIds: Set<string>): void {
  for (const id of pinned.keys()) if (!visibleIds.has(id)) pinned.delete(id)
}
