import { type ComponentType, type ReactNode } from 'react'
import { GraphContainer } from './components/GraphContainer'
import { GraphControls } from './components/GraphControls'
import { GraphHeader } from './components/GraphHeader'
import { useGraphSimulation } from './hooks/useGraphSimulation'
import { useGraphState } from './hooks/useGraphState'
import type { GraphChildProps, GraphData } from './NetworkGraph.types'
import { Flex } from '@soroush.tech/design-system/Flex'

export interface NetworkGraphProps {
  /** The fully-derived render graph to display. */
  data: GraphData
  /** Title content shown in the header (keeps the graph content-agnostic). */
  heading: ReactNode
  /** A content component (e.g. a legend) rendered with the derived `GraphChildProps`. */
  graphChildren: ComponentType<GraphChildProps>
}

/** Generic, interactive D3 force-directed graph. Accepts a pre-built `data` graph
 *  and renders it with a consumer-supplied content component and zoom controls. */
export function NetworkGraph({
  data,
  heading,
  graphChildren: GraphChildren,
}: Readonly<NetworkGraphProps>) {
  const {
    activeNode,
    setActiveNode,
    expandedNodes,
    toggleNode,
    visibleIds,
    showOptional,
    toggleOptional,
    hasOptional,
  } = useGraphState(data)
  const { containerRef, dispatch } = useGraphSimulation({
    data,
    visibleIds,
    expandedNodes,
    onActivate: setActiveNode,
    onToggle: toggleNode,
  })

  return (
    <Flex minHeight="600px" flexGrow={1} position="relative">
      <GraphHeader activeNode={activeNode} heading={heading} />
      <GraphContainer ref={containerRef} flexGrow={1} />
      {!!GraphChildren && (
        <GraphChildren
          topLevelIds={data.topLevelIds}
          titleById={data.titleById}
          childrenByParent={data.childrenByParent}
          optionalIds={data.optionalIds}
          areasByNode={data.areasByNode}
          expandedNodes={expandedNodes}
          onToggle={toggleNode}
          hasOptional={hasOptional}
          showOptional={showOptional}
          onToggleOptional={toggleOptional}
        />
      )}
      <GraphControls
        onZoomIn={() => dispatch('graph:zoom-in')}
        onZoomOut={() => dispatch('graph:zoom-out')}
        onReset={() => dispatch('graph:reset')}
      />
    </Flex>
  )
}
