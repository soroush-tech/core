import type { ToolbarAction } from 'src/theme/Markdown/const'

/**
 * Splits actions into render segments: consecutive actions sharing a `group` id collapse into
 * one segment (rendered as a joined `ButtonGroup`); ungrouped actions each get their own.
 */
export function groupToolbarActions(actions: readonly ToolbarAction[]): ToolbarAction[][] {
  const segments: ToolbarAction[][] = []
  actions.forEach((action) => {
    const current = segments.at(-1)
    if (current && action.group !== undefined && current[0].group === action.group) {
      current.push(action)
    } else {
      segments.push([action])
    }
  })
  return segments
}
