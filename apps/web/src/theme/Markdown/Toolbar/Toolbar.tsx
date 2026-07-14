import { Button } from 'src/theme/Button'
import { ButtonGroup } from 'src/theme/ButtonGroup'
import { Flex } from 'src/theme/Flex'
import { Icon } from 'src/theme/Icon'
import { NativeSelect } from 'src/theme/NativeSelect'
import { Typography } from 'src/theme/Typography'
import { styled } from 'src/theme'
import { useMarkdownContext } from 'src/theme/Markdown/MarkdownContext'
import { buildTableSnippet } from 'src/theme/Markdown/utils/buildTableSnippet'
import { groupToolbarActions } from 'src/theme/Markdown/utils/groupToolbarActions'
import {
  CODE_LANGUAGES,
  HEADING_ACTIONS,
  INLINE_CODE_ACTION,
  TOOLBAR_ACTIONS,
  codeBlockAction,
  type LinePrefixAction,
  type ToolbarAction,
} from 'src/theme/Markdown/const'
import { TablePicker } from './TablePicker'

const HEADING_OPTIONS = HEADING_ACTIONS.map((action) => ({ label: action.label, value: action.id }))

const HEADING_BY_ID: Record<string, LinePrefixAction> = Object.fromEntries(
  HEADING_ACTIONS.map((action) => [action.id, action])
)

// line-through has no Typography style prop, so a thin styled Typography carries it.
const StrikeLabel = styled(Typography, { label: 'MarkdownStrike' })({
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
    <Flex
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
      </Flex>
    </Flex>
  )
}
