import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { GraphData, GraphLink, GraphNode } from '../NetworkGraph.types'
import {
  AREA_RADIUS_BASE,
  AREA_RADIUS_PER_CHILD,
  AREA_SEPARATION_STRENGTH,
  AREA_SHARED_ALLOWANCE,
  CENTER_STRENGTH,
  CHARGE_STRENGTH,
  COLLIDE_PADDING,
  MAX_GROUP_DISTANCE,
  SOFT_ANCHOR_STRENGTH,
  VIEW_SIZE,
  ZOOM_STEP,
} from '../const'
import { anchorExpandedNodes } from '../utils/anchorExpandedNodes'
import { buildLinks } from '../utils/buildLinks'
import { buildNodes } from '../utils/buildNodes'
import { forceAreaSeparation } from '../utils/forceAreaSeparation'
import { forceMaxGroupDistance } from '../utils/forceMaxGroupDistance'
import { linkClass, linkDistance, linkStrength } from '../utils/linkStyle'
import { prunePins } from '../utils/prunePins'

type GraphEvent = 'graph:zoom-in' | 'graph:zoom-out' | 'graph:reset'

export interface UseGraphSimulationParams {
  /** The full render graph (nodes, links, branchIds, rootId). */
  data: GraphData
  visibleIds: Set<string>
  expandedNodes: Set<string>
  /** Called when a node is hovered, to update the active-node readout */
  onActivate: (id: string) => void
  /** Called when a branch node is clicked, to expand/collapse it */
  onToggle: (id: string) => void
}

/** Owns the imperative D3 force-directed graph: SVG, zoom, simulation, and the
 *  enter/exit sync of visible nodes. Returns the container ref to mount the SVG
 *  into and a `dispatch` for the zoom controls. */
export function useGraphSimulation({
  data,
  visibleIds,
  expandedNodes,
  onActivate,
  onToggle,
}: UseGraphSimulationParams) {
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null)
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const forceLinkRef = useRef<d3.ForceLink<GraphNode, GraphLink> | null>(null)
  const clampForceRef = useRef<ReturnType<typeof forceMaxGroupDistance> | null>(null)
  const areaSepRef = useRef<ReturnType<typeof forceAreaSeparation> | null>(null)
  const positionsRef = useRef(new Map<string, { x: number; y: number }>())
  // Areas the viewer has dragged — pinned here so they stay put across rebuilds.
  const pinnedRef = useRef(new Map<string, { x: number; y: number }>())
  // Soft-anchor targets for opened areas / expanded nodes — they hold here but drift.
  const anchorsRef = useRef(new Map<string, { x: number; y: number }>())

  // ── Init: create SVG, zoom, and empty simulation (runs once) ─────────────
  // d3 imperative DOM + simulation code: jsdom has no layout engine (clientWidth
  // is 0, no interaction), so this is validated by NetworkGraph.browser.test.tsx
  // (real Chromium), not the jsdom unit tests.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Fixed logical coordinate space; the SVG (sized by CSS in GraphContainer)
    // scales this viewBox to fit, so the graph zooms to fill rather than leaving
    // margins. Width/height/position are owned by CSS, not these attributes.
    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
    svgRef.current = svg

    const g = svg.append('g')
    gRef.current = g

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .filter((event: Event) => event.type !== 'wheel' || (event as WheelEvent).ctrlKey)
      // Match a button press: one ctrl+scroll notch zooms by ZOOM_STEP (d3 scales by 2^wheelDelta)
      .wheelDelta((event) => (event.deltaY < 0 ? 1 : -1) * Math.log2(ZOOM_STEP))
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })
    svg.call(zoom).on('dblclick.zoom', null) // disable d3's default double-click zoom

    const forceLink = d3
      .forceLink<GraphNode, GraphLink>([])
      .id((d) => d.id)
      .distance(linkDistance)
      .strength(linkStrength)
    forceLinkRef.current = forceLink

    // Soft ceiling: nudge any group member that drifts past MAX_GROUP_DISTANCE back
    // toward its hub, so charge repulsion can't fling members far from their group.
    const clampForce = forceMaxGroupDistance(MAX_GROUP_DISTANCE)
    clampForceRef.current = clampForce

    // Each area is the centre of a circle sized by its child count; this pushes the
    // circles apart so they only overlap where areas share a node. Configured per rebuild.
    const areaSep = forceAreaSeparation({
      radiusBase: AREA_RADIUS_BASE,
      radiusPerChild: AREA_RADIUS_PER_CHILD,
      sharedAllowance: AREA_SHARED_ALLOWANCE,
      strength: AREA_SEPARATION_STRENGTH,
    })
    areaSepRef.current = areaSep

    // Soft anchor: gently hold each opened area / expanded node at the spot it was
    // opened (anchorsRef), so it stays put yet drifts when the separation force pushes.
    // d[axis] is always set: buildNodes seeds x/y on every node before d3 reads this.
    const anchorAt = (axis: 'x' | 'y') => (d: GraphNode) =>
      anchorsRef.current.get(d.id)?.[axis] ?? d[axis]!
    const anchorStrength = (d: GraphNode) =>
      anchorsRef.current.has(d.id) ? SOFT_ANCHOR_STRENGTH : 0

    const simulation = d3
      .forceSimulation<GraphNode>([])
      .force('link', forceLink)
      .force('groupClamp', clampForce)
      .force('areaSep', areaSep)
      .force('anchorX', d3.forceX<GraphNode>(anchorAt('x')).strength(anchorStrength))
      .force('anchorY', d3.forceY<GraphNode>(anchorAt('y')).strength(anchorStrength))
      // Areas are pinned hubs (positioned in buildNodes) and exert no charge, so they
      // never push the tech nodes around; only tech repels tech.
      .force(
        'charge',
        d3.forceManyBody<GraphNode>().strength((d) => (d.group > 0 ? 0 : CHARGE_STRENGTH))
      )
      // Collision keeps circles + labels from overlapping (the main de-tangler)
      .force(
        'collide',
        d3.forceCollide<GraphNode>().radius((d) => d.size / 2 + COLLIDE_PADDING)
      )
      // Gentle centring so a root-less graph stays in view; a pinned root (if any)
      // overrides this via fx/fy, so branches still radiate into free space.
      .force('x', d3.forceX<GraphNode>(VIEW_SIZE / 2).strength(CENTER_STRENGTH))
      .force('y', d3.forceY<GraphNode>(VIEW_SIZE / 2).strength(CENTER_STRENGTH))
    simulationRef.current = simulation

    g.append('g').attr('class', 'links')
    g.append('g').attr('class', 'nodes')

    simulation.on('tick', () => {
      g.select('.links')
        .selectAll<SVGLineElement, GraphLink>('.link')
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!)

      g.select('.nodes')
        .selectAll<SVGGElement, GraphNode>('.node-group')
        .attr('transform', (d) => {
          positionsRef.current.set(d.id, { x: d.x!, y: d.y! })
          return `translate(${d.x!},${d.y!})`
        })
    })

    const onZoomIn = () => svg.transition().call(zoom.scaleBy, ZOOM_STEP)
    const onZoomOut = () => svg.transition().call(zoom.scaleBy, 1 / ZOOM_STEP)
    const onReset = () => svg.transition().call(zoom.transform, d3.zoomIdentity)
    container.addEventListener('graph:zoom-in', onZoomIn)
    container.addEventListener('graph:zoom-out', onZoomOut)
    container.addEventListener('graph:reset', onReset)

    return () => {
      simulation.stop()
      container.removeEventListener('graph:zoom-in', onZoomIn)
      container.removeEventListener('graph:zoom-out', onZoomOut)
      container.removeEventListener('graph:reset', onReset)
      svg.remove()
    }
  }, [])

  // ── Update: sync visible nodes into the running simulation ────────────────
  // d3 enter/exit/drag against the DOM — same jsdom limitation as init above.
  useEffect(() => {
    // The init effect sets these three refs together — or, when the container
    // hasn't mounted (e.g. an isolated renderHook), leaves all three null — so a
    // single simulation check is a sufficient guard for all of them.
    const simulation = simulationRef.current
    if (!simulation) return
    const g = gRef.current!
    const forceLink = forceLinkRef.current!

    // Drop drag-pins for nodes that are no longer visible (e.g. their area was
    // collapsed), so reopening reflows them fresh instead of snapping to the old spot.
    prunePins(pinnedRef.current, visibleIds)

    const nodes = buildNodes(
      data.nodes,
      data.links,
      data.rootId,
      visibleIds,
      positionsRef.current,
      pinnedRef.current
    )
    // Soft-anchor opened areas / expanded nodes at their settled spot so opening one
    // reflows around it instead of jumping it — held loosely, free to drift.
    anchorExpandedNodes(expandedNodes, positionsRef.current, anchorsRef.current)
    // An area hub is always on screen, but an inactive area draws no *containment*
    // path to its tech — drop those. Relation edges (e.g. area↔area) are always kept.
    const inactiveArea = (id: string) => data.topLevelIds.includes(id) && !expandedNodes.has(id)
    const links = buildLinks(data.links, nodes).filter(
      (l) => l.kind !== undefined || !inactiveArea(l.source as string)
    )

    // Configure before nodes(): d3 calls areaSep.initialize(nodes) on assignment, and
    // it sizes the area circles from data.areasByNode, which must be set by then.
    areaSepRef.current!.config(data.topLevelIds, data.areasByNode)
    simulation.nodes(nodes)
    forceLink.links(links)
    clampForceRef.current!.links(links)

    // Links have no interactive state — safe to remove and re-enter each update
    const linkG = g.select<SVGGElement>('.links')
    linkG.selectAll('.link').remove()
    linkG
      .selectAll<SVGLineElement, GraphLink>('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', linkClass)

    // Nodes use enter/exit to preserve drag state on existing nodes
    const nodeG = g.select<SVGGElement>('.nodes')
    const nodeSel = nodeG.selectAll<SVGGElement, GraphNode>('.node-group').data(nodes, (d) => d.id)

    nodeSel.exit().remove()

    // Drag callbacks fire only from a real d3 pointer-drag gesture, which jsdom
    // cannot synthesise — exercised by NetworkGraph.browser.test.tsx instead.
    const dragBehavior = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        // Every dragged node stays pinned where it was dropped (until its area closes).
        pinnedRef.current.set(d.id, { x: d.fx!, y: d.fy! })
      })

    // Group label nodes are the sources of group-kind edges — styled gray.
    const groupNodeIds = new Set(
      data.links.filter((l) => l.kind === 'group').map((l) => l.source as string)
    )
    const topLevelSet = new Set(data.topLevelIds)
    const entered = nodeSel
      .enter()
      .append('g')
      .attr('class', (d) => {
        let role = ''
        if (d.id === data.rootId) role = ' is-root'
        else if (topLevelSet.has(d.id)) role = ' is-area'
        const category = data.branchIds.has(d.id) ? ' is-category' : ''
        const group = groupNodeIds.has(d.id) ? ' is-group-node' : ''
        return `node-group${role}${category}${group}`
      })
      .on('mouseover', function (_event, d) {
        onActivate(d.title)
        d3.select(this)
          .select<SVGCircleElement>('.node-core')
          .transition()
          .attr('r', d.size / 2 + 2)
      })
      .on('mouseout', function () {
        d3.select(this).select<SVGCircleElement>('.node-core').transition().attr('r', 4)
      })
      .on('click', (_event, d) => {
        if (!data.branchIds.has(d.id)) return
        onToggle(d.id)
      })

    // Group label nodes render as a rounded rectangle wrapping their label; every other
    // node is a circle (ring + core) with the label below it.
    const groupEntered = entered.filter((d) => groupNodeIds.has(d.id))
    const plainEntered = entered.filter((d) => !groupNodeIds.has(d.id))

    plainEntered
      .append('circle')
      .attr('class', 'node-ring')
      .attr('r', (d) => d.size / 2)
    plainEntered.append('circle').attr('class', 'node-core').attr('r', 4)
    plainEntered
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', (d) => d.size / 2 + 15)
      .attr('text-anchor', 'middle')
      .text((d) => d.title)

    const GROUP_PAD_X = 8
    const GROUP_PAD_Y = 4
    groupEntered.append('rect').attr('class', 'node-rect').attr('rx', 6).attr('ry', 6)
    groupEntered
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.32em') // centre the label within the rect
      .attr('text-anchor', 'middle')
      .text((d) => d.title)
    // Size each rect to its measured label. getBBox needs a layout engine; jsdom has
    // none (it throws), so guard it — the real geometry is covered by the browser test.
    groupEntered.each(function () {
      const label = d3.select<SVGGElement, GraphNode>(this).select<SVGTextElement>('.node-label')
      let box: DOMRect
      try {
        box = label.node()!.getBBox()
      } catch {
        return
      }
      d3.select(this)
        .select('.node-rect')
        .attr('x', box.x - GROUP_PAD_X)
        .attr('y', box.y - GROUP_PAD_Y)
        .attr('width', box.width + GROUP_PAD_X * 2)
        .attr('height', box.height + GROUP_PAD_Y * 2)
    })

    // Expand/collapse icon appears only on branch nodes
    entered
      .filter((d) => data.branchIds.has(d.id))
      .append('text')
      .attr('class', 'node-expand-icon')
      .attr('dy', (d) => -(d.size / 2) - 6)
      .attr('text-anchor', 'middle')

    // Re-apply drag to all visible nodes so rebind after collapse doesn't break drag
    entered.merge(nodeSel).call(dragBehavior)

    // Sync expanded state and icon text across all branch nodes (entered + existing)
    nodeG
      .selectAll<SVGGElement, GraphNode>('.node-group.is-category')
      .classed('is-expanded', (d) => expandedNodes.has(d.id))
      .select('.node-expand-icon')
      .text((d) => (expandedNodes.has(d.id) ? '−' : '+'))

    simulation.alpha(0.3).restart()
  }, [data, visibleIds, expandedNodes, onActivate, onToggle])

  const dispatch = (name: GraphEvent) => {
    containerRef.current?.dispatchEvent(new Event(name))
  }

  return { containerRef, dispatch }
}
