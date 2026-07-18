import { Button } from '@soroush.tech/design-system/Button'
import { ButtonGroup } from '@soroush.tech/design-system/ButtonGroup'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { NativeSelect } from '@soroush.tech/design-system/NativeSelect'
import { Typography } from '@soroush.tech/design-system/Typography'
import { styled } from '@soroush.tech/design-system'
import { useMarkdownContext } from '../MarkdownContext'
import { buildTableSnippet } from '../utils/buildTableSnippet'
import { groupToolbarActions } from '../utils/groupToolbarActions'
import {
  CODE_LANGUAGES,
  HEADING_ACTIONS,
  INLINE_CODE_ACTION,
  MERMAID_DIAGRAMS,
  TOOLBAR_ACTIONS,
  codeBlockAction,
  mermaidDiagramAction,
  type LinePrefixAction,
  type ToolbarAction,
} from '../const'
import { TablePicker } from './TablePicker'

const HEADING_OPTIONS = HEADING_ACTIONS.map((action) => ({ label: action.label, value: action.id }))

const DIAGRAM_OPTIONS = MERMAID_DIAGRAMS.map((diagram) => ({
  label: diagram.label,
  value: diagram.value,
}))

const DIAGRAM_SNIPPET_BY_VALUE: Record<string, string> = Object.fromEntries(
  MERMAID_DIAGRAMS.map((diagram) => [diagram.value, diagram.snippet])
)

const HEADING_BY_ID: Record<string, LinePrefixAction> = Object.fromEntries(
  HEADING_ACTIONS.map((action) => [action.id, action])
)

// line-through has no Typography style prop, so a thin styled Typography carries it.
// Named styled root — theme-customizable via
// `theme.components.MarkdownToolbar.styleOverrides.root`.
const ToolbarRoot = styled(Flex, { name: 'MarkdownToolbar', label: 'MarkdownToolbar' })()

const StrikeLabel = styled(Typography, {
  name: 'MarkdownToolbar',
  slot: 'strike',
  label: 'MarkdownStrike',
})({
  textDecoration: 'line-through',
})

/** Renders a button's content: an icon, an emphasis-styled letter, or the plain label. */
function ActionLabel({ action }: Readonly<{ action: ToolbarAction }>) {
  if (action.icon) return <Icon name={action.icon} size="1.1rem" />
  if (action.emphasis === 'bold')
    return (
      <Typography as="span" variant="inherit" fontWeight="extraBold">
        {action.label}
      </Typography>
    )
  if (action.emphasis === 'italic')
    return (
      <Typography as="span" variant="inherit" fontStyle="italic">
        {action.label}
      </Typography>
    )
  if (action.emphasis === 'strike')
    return (
      <StrikeLabel as="span" variant="inherit">
        {action.label}
      </StrikeLabel>
    )
  return <>{action.label}</>
}

/** Formatting buttons, heading + code-language selects, and the table-size picker. */
export function Toolbar() {
  const { dispatch } = useMarkdownContext()

  const renderButton = (action: ToolbarAction) => (
    <Button
      key={action.id}
      type="button"
      variant="outlined"
      size="sm"
      aria-label={action.ariaLabel}
      onClick={() => dispatch(action)}
    >
      <ActionLabel action={action} />
    </Button>
  )

  return (
    <ToolbarRoot
      flexDirection="row"
      flexWrap="wrap"
      gap={1}
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <NativeSelect
        size="sm"
        variant="outlined"
        placeholder="Heading"
        value=""
        options={HEADING_OPTIONS}
        onChange={(value) => dispatch(HEADING_BY_ID[String(value)])}
        selectProps={{ 'aria-label': 'Heading level' }}
      />
      {groupToolbarActions(TOOLBAR_ACTIONS).map((segment) =>
        segment.length > 1 ? (
          <ButtonGroup key={segment[0].id} borderRadius="sq" size="sm" variant="outlined">
            {segment.map(renderButton)}
          </ButtonGroup>
        ) : (
          renderButton(segment[0])
        )
      )}
      <TablePicker
        onSelect={(rows, cols) =>
          dispatch({
            id: 'table',
            label: 'Table',
            ariaLabel: 'Table',
            kind: 'insert',
            snippet: buildTableSnippet(rows, cols),
          })
        }
      />
      <Flex flexDirection="row" gap={0} alignItems="stretch">
        {renderButton(INLINE_CODE_ACTION)}
        <NativeSelect
          size="sm"
          variant="outlined"
          placeholder="Code"
          value=""
          options={CODE_LANGUAGES}
          onChange={(value) => dispatch(codeBlockAction(String(value)))}
          selectProps={{ 'aria-label': 'Code block language' }}
        />
        <NativeSelect
          size="sm"
          variant="outlined"
          placeholder="Diagram"
          value=""
          options={DIAGRAM_OPTIONS}
          onChange={(value) =>
            dispatch(mermaidDiagramAction(DIAGRAM_SNIPPET_BY_VALUE[String(value)]))
          }
          selectProps={{ 'aria-label': 'Mermaid diagram type' }}
        />
      </Flex>
    </ToolbarRoot>
  )
}
