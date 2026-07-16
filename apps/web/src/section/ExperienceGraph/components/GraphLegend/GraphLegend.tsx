import { Fragment } from 'react'
import { styled, useTheme } from '@soroush.tech/design-system'
import type { GraphChildProps } from 'src/common/NetworkGraph'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Switch } from '@soroush.tech/design-system/Switch'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

// backdrop-filter and media query require CSS — can't be expressed as props.
const LegendPanel = styled(View)`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 20rem;
  z-index: 20;
  padding: ${({ theme }) => theme.space[2]};
  padding-top: ${({ theme }) => theme.space[4]};
  overflow-y: auto;
  background: ${({ theme }) => theme.background.paper}CC;
  backdrop-filter: blur(12px);

  @media (max-width: 1024px) {
    display: none;
  }
`

const Pulse = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: ${({ theme }) => theme.border.primary};
  margin-right: 0.75rem;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`
/** Stagger between consecutive child rows as they cascade in (ms). */
const STAGGER_MS = 40
// cursor and :hover color can't be expressed as props.
const CategoryRow = styled(Flex)`
  cursor: pointer;
  color: ${({ theme }) => theme.text.initial};

  &:hover {
    color: ${({ theme }) => theme.border.primary};
  }
`

// border, background with opacity, and > span styles require CSS.
const CategoryGlyph = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.border.primary};
  background: ${({ theme }) => theme.border.primary}1A;

  & > span {
    display: block;
    width: 0.25rem;
    height: 0.25rem;
    background-color: ${({ theme }) => theme.border.primary};
  }
`

// grid-template-rows 0fr→1fr animates height in both directions; the inner
// wrapper clips the rows while collapsed.
const ChildList = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 240ms ease;

  &[data-open='true'] {
    grid-template-rows: 1fr;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

// padding-left indents each nested level; because lists nest inside one another it
// compounds, so a row's indent reflects its depth without per-row margins.
const ChildListInner = styled.div`
  overflow: hidden;
  min-height: 0;
  padding-left: ${({ theme }) => theme.space[2]};
  margin-left: ${({ theme }) => theme.space[0.5]};
`

const ChildRow = styled(Flex)`
  opacity: 0;

  /* Re-runs the stagger each time the list opens (ChildList carries data-open). */
  [data-open='true'] & {
    animation: legendChildIn 220ms ease both;
  }

  @keyframes legendChildIn {
    from {
      opacity: 0;
      transform: translateX(-6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;

    [data-open='true'] & {
      animation: none;
    }
  }
`

// A branch child reuses ChildRow's cascade-in animation but, like a category, is
// clickable to expand/collapse its own children.
const BranchRow = styled(ChildRow)`
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.border.primary};
  }
`

interface LegendChildProps {
  id: string
  /** The area this subtree hangs under — children are kept only if they gate to it. */
  areaId: string
  /** Position within its sibling list — drives the cascade-in stagger. */
  index: number
  titleById: Map<string, string>
  expandedNodes: Set<string>
  onToggle: (id: string) => void
  /** A node's children shown under `areaId` (legacy + other-area items filtered out). */
  childrenOf: (id: string, areaId: string) => string[]
}

/** One menu row, rendered recursively. A node with shown children is a clickable
 *  branch (caret + nested list, sharing the graph's expand state); otherwise a leaf.
 *  Indentation comes from the nested list wrappers, not the row. */
function LegendChild({
  id,
  areaId,
  index,
  titleById,
  expandedNodes,
  onToggle,
  childrenOf,
}: Readonly<LegendChildProps>) {
  const children = childrenOf(id, areaId)
  const animationDelay = `${index * STAGGER_MS}ms`

  if (children.length === 0)
    return (
      <ChildRow
        flexDirection="row"
        alignItems="center"
        fontSize={0}
        mb={1.5}
        color="secondary"
        style={{ animationDelay }}
      >
        <span>{titleById.get(id)}</span>
      </ChildRow>
    )

  const isExpanded = expandedNodes.has(id)
  return (
    <>
      <BranchRow
        flexDirection="row"
        alignItems="center"
        fontSize={0}
        mb={1.5}
        color="secondary"
        style={{ animationDelay }}
        onClick={() => onToggle(id)}
      >
        <span>{titleById.get(id)}</span>
        <Flex flexGrow={1} />
        <Typography as="span" color="primary">
          {isExpanded ? '−' : '+'}
        </Typography>
      </BranchRow>

      <ChildList data-open={isExpanded}>
        <ChildListInner>
          {children.map((child, childIndex) => (
            <LegendChild
              key={child}
              id={child}
              areaId={areaId}
              index={childIndex}
              titleById={titleById}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              childrenOf={childrenOf}
            />
          ))}
        </ChildListInner>
      </ChildList>
    </>
  )
}

export function GraphLegend({
  topLevelIds,
  titleById,
  childrenByParent,
  optionalIds,
  areasByNode,
  expandedNodes,
  onToggle,
  hasOptional,
  showOptional,
  onToggleOptional,
}: Readonly<GraphChildProps>) {
  const theme = useTheme()

  // A node's children under a given area: legacy items drop while the switch is off, and
  // a shared child (e.g. React Native under React) stays only beneath the area it gates
  // to — so it shows under Mobile, not Web. Nodes with no gate (empty map) aren't filtered.
  const childrenOf = (id: string, areaId: string) =>
    (childrenByParent.get(id) ?? []).filter((child) => {
      if (!showOptional && optionalIds.has(child)) return false
      const areas = areasByNode.get(child)
      return !areas?.length || areas.includes(areaId)
    })

  return (
    <LegendPanel>
      {hasOptional && (
        <Flex
          justifyContent="space-between"
          flexDirection="row"
          alignItems="center"
          mb={2}
          pb={2}
          borderBottom={`1px solid ${theme.text.secondary}26`}
        >
          <Typography textTransform="uppercase" fontSize={0} m={0} lineHeight="none">
            Show legacy
          </Typography>
          <Switch size="sm" checked={showOptional} onChange={onToggleOptional} color="primary" />
        </Flex>
      )}
      <Typography
        as="h3"
        fontSize={0}
        fontWeight="bold"
        letterSpacing="widest"
        textTransform="uppercase"
        mb={3}
        display="flex"
        alignItems="center"
        color="primary"
      >
        <Pulse />
        CATEGORIES
      </Typography>

      <View>
        <Flex>
          {topLevelIds.map((category) => {
            const isExpanded = expandedNodes.has(category)
            return (
              <Fragment key={category}>
                <CategoryRow
                  flexDirection="row"
                  alignItems="center"
                  fontSize={0}
                  mb={1.5}
                  onClick={() => onToggle(category)}
                >
                  <CategoryGlyph
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    width="0.75rem"
                    height="0.75rem"
                    mr={1}
                  >
                    <span />
                  </CategoryGlyph>
                  <span>{titleById.get(category)}</span>
                  <Flex flexGrow={1} />
                  <Typography as="span" color="primary">
                    {isExpanded ? '−' : '+'}
                  </Typography>
                </CategoryRow>

                <ChildList data-open={isExpanded}>
                  <ChildListInner>
                    {childrenOf(category, category).map((child, index) => (
                      <LegendChild
                        key={child}
                        id={child}
                        areaId={category}
                        index={index}
                        titleById={titleById}
                        expandedNodes={expandedNodes}
                        onToggle={onToggle}
                        childrenOf={childrenOf}
                      />
                    ))}
                  </ChildListInner>
                </ChildList>
              </Fragment>
            )
          })}
        </Flex>
      </View>

      <View mt={3} pt={3} borderTop={`1px solid ${theme.text.secondary}26`}>
        <Typography variant="body1" fontSize={0} fontWeight="bold" color="primary">
          Experience Across Technologies
        </Typography>
        <Typography variant="caption" fontSize={0} mt={1} color="secondary">
          This graph visualizes Masoud's hands-on experience across technologies, highlighting the
          tools, frameworks, and platforms he has worked with throughout his career.
        </Typography>
      </View>
    </LegendPanel>
  )
}
