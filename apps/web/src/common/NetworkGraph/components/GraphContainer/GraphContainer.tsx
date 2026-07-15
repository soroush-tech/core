import styled from '@emotion/styled'
import { Flex } from '@soroush.tech/design-system/Flex'

// cursor has no styled-system prop. D3 class selectors live here since D3
// appends SVG elements directly into this container.
export const GraphContainer = styled(Flex)`
  cursor: move;
  position: relative;
  overflow: hidden;

  /* Absolute + inset:0 makes the SVG fill the flex-sized box and stay out of
     flow, so its viewBox aspect ratio can't drive the container's height. */
  & > svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .link {
    stroke: ${({ theme }) => theme.text.secondary};
    stroke-opacity: 0.2;
    stroke-width: 1px;
  }
  /* Relation threads: green, dotted (same dashes as group lines) — lateral cross-links. */
  .link.is-relation {
    stroke: ${({ theme }) => theme.text.primary};
    stroke-opacity: 0.3;
    stroke-dasharray: 4 4;
    stroke-linecap: round;
  }
  /* Area↔area relations: the strong backbone between areas — heavier + more opaque. */
  .link.is-area-relation {
    stroke: ${({ theme }) => theme.text.primary};
    stroke-opacity: 0.3;
    stroke-width: 2px;
  }
  /* Group lines: gray dotted so a group hub's spokes read as categorical, not tree edges. */
  .link.is-group {
    stroke: ${({ theme }) => theme.text.secondary};
    stroke-opacity: 0.4;
    stroke-dasharray: 4 4;
    stroke-linecap: round;
  }
  /* Group label nodes render gray as a rounded rectangle wrapping their label. */
  .node-rect {
    fill: ${({ theme }) => theme.background.primary};
    stroke: ${({ theme }) => theme.text.secondary};
    stroke-width: 1px;
  }
  .node-group.is-group-node .node-label {
    fill: ${({ theme }) => theme.text.secondary};
  }
  .node-ring {
    stroke: ${({ theme }) => theme.text.primary};
    stroke-width: 1px;
    fill: ${({ theme }) => theme.background.primary};
    transition:
      fill 0.2s,
      stroke-width 0.2s;
  }
  .node-core {
    fill: ${({ theme }) => theme.text.primary};
  }
  /* Role colours: root = brand green, parent node = info; area + leaf keep border.primary,
     group its gray rect. Areas are also branches, so parent nodes are is-category:not(.is-area). */
  .is-root .node-ring {
    stroke: ${({ theme }) => theme.text.info};
  }
  .is-root .node-core {
    fill: ${({ theme }) => theme.text.primary};
  }

  .node-label {
    font-family: ${({ theme }) => theme.fonts.body};
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
    pointer-events: none;
    margin-top: 2px;
    fill: ${({ theme }) => theme.text.initial};
    fill-opacity: 0.8;
  }

  .is-group-node .node-label {
    font-size: ${({ theme }) => theme.fontSizes[0]}px;
    padding-top: 2px;
  }
  .node-expand-icon {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: bold;
    fill: ${({ theme }) => theme.border.primary};
    pointer-events: none;
    opacity: 0.7;
  }
  .node-group {
    cursor: grab;
  }
  .node-group.is-category {
    cursor: pointer;
  }
  .node-group:active {
    cursor: grabbing;
  }
  .is-category .node-ring {
    stroke-width: 1.5px;
  }
  .is-category.is-expanded .node-ring {
    fill: ${({ theme }) => theme.border.primary}20;
    stroke-width: 2px;
  }
`
