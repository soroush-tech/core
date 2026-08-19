# NetworkGraph

Generic, interactive D3 force-directed graph. It is **data-agnostic**: pass it a
pre-built `GraphData` object and a `heading`, and it renders a draggable, zoomable
node network with an expandable category sidebar and a zoom control cluster. The
graph holds no domain data of its own - a producer (e.g. a section's data layer)
builds the `GraphData` and supplies it.

## Props

| Prop      | Type        | Description                                                        |
| --------- | ----------- | ------------------------------------------------------------------ |
| `data`    | `GraphData` | The fully-derived render graph (see below). Built by the consumer. |
| `heading` | `ReactNode` | Title content shown in the header - keeps the graph content-free.  |

### `GraphData`

| Field              | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `rootId`           | Central core node, pinned at the centre, always visible    |
| `nodes`            | Every node (flattened, with `title` + `size`)              |
| `links`            | Parent → child edges (a shared node has several)           |
| `branchIds`        | Node ids that have children and can be expanded            |
| `topLevelIds`      | Area nodes (direct children of root), listed in the legend |
| `childrenByParent` | Maps each branch id to its direct child ids                |
| `titleById`        | Maps a node id to its display title                        |

## Structure

`NetworkGraph.tsx` is a thin composition that wires the hooks to the sub-components:

```
NetworkGraph/
  NetworkGraph.tsx            ← composes the hooks + sub-components (props: data, heading)
  NetworkGraph.types.ts       ← GraphNode, GraphLink, RawLink, GraphData
  NetworkGraph.fixture.ts     ← small GraphData used by the unit tests
  const.ts                    ← ZOOM_STEP, VIEW_SIZE, force-layout tuning
  utils/                      ← pure helpers (computeVisibleIds, buildNodes, buildLinks,
                                anchorExpandedNodes, forceAreaSeparation, toggleSet)
  hooks/
    useGraphState             ← active node, expand/collapse set, derived visibleIds
    useGraphSimulation        ← imperative D3 SVG/zoom/force simulation + dispatch
  components/
    GraphContainer/           ← styled D3 mount target (SVG class selectors)
    GraphHeader/              ← heading + active-node readout
    GraphLegend/              ← category sidebar
    GraphControls/            ← zoom control cluster
```

`useGraphState` holds the UI state and `useGraphSimulation` consumes its
`visibleIds`/`expandedNodes` plus the `data` graph and `onActivate`/`onToggle`
callbacks to drive the D3 graph - keeping the imperative DOM code isolated from the
React state.

## Behaviour

- **Root + top-level nodes are always visible.** Other nodes appear only when an
  ancestor branch is expanded (BFS in `computeVisibleIds`).
- **Expand/collapse** via clicking a category row in the legend or a branch node in
  the graph. The row shows a `+` when collapsed and a `-` when expanded.
- **Legend children.** When a category is expanded, its direct children list in the
  legend (animating open, respecting `prefers-reduced-motion`). A child that is
  itself a branch gets a **checkbox** that expands it in the graph; a **leaf** child
  (no children of its own) shows a dash marker and label instead - a checkbox would
  be meaningless when there is nothing to expand.
- **Zoom controls** dispatch `graph:zoom-in` / `graph:zoom-out` / `graph:reset`
  DOM events on the container, which the D3 zoom behaviour listens for.
- **Hovering** a node sets the `Active Node` readout and enlarges its core.

## Testing

Each sub-component's React surface is unit tested in its own spec; the pure helpers
and `useGraphState` are unit tested directly. `NetworkGraph.test.tsx` covers the
composed wiring and the D3 graph interactions (hover, expand/collapse, zoom
dispatch) that need a full render, all driven by `NetworkGraph.fixture.ts`. The
imperative D3 code (force simulation, drag, zoom, tick handlers) depends on a real
layout engine and real pointer/touch events that jsdom does not provide, so it is
covered by `NetworkGraph.browser.test.tsx`, which runs in real Chromium via the
`unit-browser` vitest project.

## Usage

```tsx
import { NetworkGraph, type GraphData } from 'src/common/NetworkGraph'

const data: GraphData = buildMyGraph()
;<NetworkGraph data={data} heading={<>My Graph</>} />
```
