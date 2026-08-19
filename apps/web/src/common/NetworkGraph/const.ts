/** Multiplicative zoom factor per step - shared by the buttons and ctrl+scroll */
export const ZOOM_STEP = 1.3

/** Fixed logical coordinate space (square) the simulation runs in. The SVG scales
 *  this viewBox to fill its container, so the graph zooms to fit any size instead
 *  of leaving empty margins on large screens. */
export const VIEW_SIZE = 1000

// ── Force-layout tuning (raise spacing to de-tangle, lower to compact) ──
/** Node repulsion - more negative pushes clusters further apart. The weakest of the
 *  layout pulls (group > child > relation > this): it only nudges nodes off each
 *  other, while `collide` does the real overlap prevention. */
export const CHARGE_STRENGTH = -350
/** Radius of the ring the area hubs are pinned on (fraction of VIEW_SIZE). Bigger ⇒
 *  more space between areas. Areas are fixed, so tech never moves them and a dragged
 *  area stays where it's dropped. */
export const AREA_RING_RADIUS = VIEW_SIZE * 0.42
/** Target length of a containment (node→area) edge - short so tech sits close to its area. */
export const LINK_DISTANCE = 200
/** Containment link stiffness - moderate so nodes hold their area without bunching. */
export const CONTAINMENT_STRENGTH = 0.4
/** Target length of a relation (lateral) edge - longer so threads read as cross-links. */
export const RELATION_DISTANCE = 400
/** Relation link stiffness - low so threads pull gently without distorting the tree. */
export const RELATION_STRENGTH = 0.04
/** Target length of an area↔area relation - long, so the area hubs spread far apart. */
export const AREA_RELATION_DISTANCE = 240
/** Area↔area relation stiffness - firm enough to hold the areas' layout shape. */
export const AREA_RELATION_STRENGTH = 0.25
/** Target length of a group (group-node → member) edge - short so a group hub keeps
 *  its members gathered around it. */
export const GROUP_DISTANCE = 90
/** Group link stiffness - firm so members orbit their group node as one cluster. */
export const GROUP_STRENGTH = 0.5
/** Soft ceiling on how far a group member may drift from its group hub. Beyond this
 *  the clamp force nudges it back inward (proportional to the overshoot), so members
 *  stay gathered without a hard snap. Sits above GROUP_DISTANCE so the spring keeps slack. */
export const MAX_GROUP_DISTANCE = 250
/** Gentle pull toward the viewBox centre - keeps a root-less graph from drifting
 *  off-screen without hard-pinning anything. */
export const CENTER_STRENGTH = 0.04
/** Extra radius around each node so circles + labels don't overlap. */
export const COLLIDE_PADDING = 28

// ── Area circles (each area is the centre of a disk its children sit inside) ──
/** An area's circle radius when it has no visible children - its bare footprint. */
export const AREA_RADIUS_BASE = 130
/** Extra circle radius per visible child - more children ⇒ a bigger disk ⇒ more
 *  space demanded from neighbouring areas. */
export const AREA_RADIUS_PER_CHILD = 16
/** How much a single shared node lets two area circles overlap. Each node common to
 *  both areas shrinks the gap they keep, so circles meet exactly where tech is shared. */
export const AREA_SHARED_ALLOWANCE = 28
/** Stiffness of the area↔area separation push - firm enough that crowded circles
 *  spread, soft enough to settle without jitter. */
export const AREA_SEPARATION_STRENGTH = 0.7

/** Soft anchor holding an opened area / expanded node near where it was opened: a
 *  gentle pull to its captured spot, so it stays put yet drifts when the area
 *  separation pushes it - never hard-frozen. */
export const SOFT_ANCHOR_STRENGTH = 0.08
