# ExperienceGraph

Experience-page hero: Masoud's technology stack rendered as an interactive network
graph. This section **owns the data**; the rendering is the generic
[`NetworkGraph`](../../common/NetworkGraph/README.md) common component.

`ExperienceGraph.tsx` is a thin wrapper that supplies the pre-built graph data and
the heading:

```tsx
<NetworkGraph data={experienceGraphData} heading={<>Technology ... Graph</>} />
```

## Structure

```
ExperienceGraph/
  ExperienceGraph.tsx               ← supplies data + heading to NetworkGraph
  ExperienceGraph.data.ts           ← editable techNodes + TechNode/Area/Group + ROOT_ID  (EDIT THIS)
  ExperienceGraph.data.generated.ts ← derived render graph (GENERATED - do not edit)
  utils/buildGraph.ts               ← materializes techNodes → render graph (GraphData)
```

## Data flow

The render graph is **precomputed at build time**, not at runtime:

1. `ExperienceGraph.data.ts` holds the hand-authored `techNodes` (a flat graph).
2. `utils/buildGraph.ts` turns that into a `GraphData` (nodes, links, branchIds,
   topLevelIds, childrenByParent, titleById).
3. `pnpm gen:experienceGraph` (→ `scripts/gen-experienceGraph.ts`) runs the build
   once and writes `ExperienceGraph.data.generated.ts`, a typed literal.
4. `ExperienceGraph.tsx` imports `experienceGraphData` from the generated file - so
   `buildGraph` and `techNodes` never reach the client bundle and there is no
   runtime construction cost.

**After editing `techNodes`, run `pnpm gen:experienceGraph`.** The
`ExperienceGraph.data.generated.test.ts` drift guard recomputes the graph and fails
if the committed generated file is stale.

### Authoring `techNodes`

Each entry is `{ id, title?, size?, parents?, areas? }`. Cross-references are typed
against the `Area` and `Group` const objects exported alongside `techNodes` - author
`parents`/`areas` with `Area.WEB`, `Group.STATE_MANAGEMENT`, etc. rather than raw
strings, so a typo is a compile error instead of a silently broken graph.

- **`id`** - globally unique key (every edge/lookup/d3-join uses it). Duplicates
  silently corrupt the graph; `ExperienceGraph.data.test.ts` enforces uniqueness +
  that every non-root node has an incoming link.
- **`parents`** - parent ids (`ROOT_ID`, an `Area`, or a `Group`). `[ROOT_ID]` ⇒ an
  **area** (first-row child of ROOT). List several non-root parents to make a node
  shared (one identity, multiple links). Omitted/empty ⇒ a **group**: it has no fixed
  parent and is placed under the area(s) inferred from the `areas` of the children
  that name it as a parent - splitting one instance per area, and dropping out
  entirely if no area can be inferred.
- **`areas`** - restrict a node to these top-level areas (`Area` values; context
  filter). Omitted ⇒ visible under every area. This is how a shared group shows
  different children per area: e.g. `TSC` with `areas: [Area.WEB, Area.MOBILE]`
  appears under both, `Metro` with `areas: [Area.MOBILE]` only under mobile.
- **`title`** - display label (falls back to `id`). **`size`** - overrides the
  role-based default (top-level 25, branch 20, leaf 10).

## Testing

- `utils/buildGraph.test.ts` - unit tests the build logic against a synthetic dataset.
- `ExperienceGraph.data.test.ts` - validates the real generated graph against the contract.
- `ExperienceGraph.data.generated.test.ts` - drift guard (generated == fresh build).
- The interactive D3 graph itself is tested in `NetworkGraph` + the Experience e2e
  spec (`src/pages/experience/experience.e2e.ts`).
