import { styled } from '@soroush.tech/design-system'
import { Flex } from '@soroush.tech/design-system/Flex'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import { TrashMark } from '../../assets/TrashMark'
import { useDrafts } from '../../hooks/useDrafts'
import { useGists } from '../../hooks/useGists'
import { describeDraft } from './utils/describeDraft'

export interface DraftListProps {
  /** The gist currently open, so its row can read as selected. */
  selectedId: string | null
  onSelect: (gistId: string) => void
}

/**
 * Discard stays out of the way until the row is hovered - `opacity` rather
 * than `display`, so it keeps its place in the tab order and `:focus-within`
 * brings it back for keyboard users. Same treatment as a file row.
 */
const DraftRow = styled(Flex)`
  & [data-draft-action] {
    opacity: 0;
  }
  &:hover [data-draft-action],
  &:focus-within [data-draft-action] {
    opacity: 1;
  }
`

/** Gists with unpublished changes - the way back to work in progress. */
export function DraftList({ selectedId, onSelect }: Readonly<DraftListProps>) {
  const { drafts, error, isLoading, discard } = useDrafts()
  // Only for naming the rows: a draft holds no record of what its gist is
  // called, and a list of filenames is a poor way to recognise one.
  const { gists } = useGists()

  const described = new Map(gists.map((gist) => [gist.id, gist.description]))
  const rows = Object.entries(drafts).map(([gistId, draft]) =>
    describeDraft(gistId, draft, described.get(gistId))
  )

  return (
    <Flex flexDirection="column" gap={2} p={3} minHeight={0} overflow="auto">
      <Typography variant="h6" m={0}>
        Drafts
      </Typography>

      {isLoading && <LinearProgress />}

      {error && (
        <Typography role="alert" variant="caption" color="error" m={0}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <Typography variant="caption" color="secondary" m={0}>
          Nothing unpublished.
        </Typography>
      )}

      {rows.map((row) => (
        <DraftRow
          key={row.gistId}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Pressable
            as="button"
            type="button"
            feedback="highlight"
            p={1}
            // Named by the draft alone: the change count below is supporting
            // detail, and letting it into the name makes rows hard to tell apart.
            aria-label={row.title}
            aria-pressed={row.gistId === selectedId}
            onClick={() => onSelect(row.gistId)}
          >
            <Flex flexDirection="column">
              <Typography variant="caption" color="initial" mb={1}>
                {row.title}
              </Typography>
              <Typography variant="caption" color="secondary" m={0}>
                {row.changeCount === 1
                  ? '1 unpublished change'
                  : `${String(row.changeCount)} unpublished changes`}
              </Typography>
            </Flex>
          </Pressable>
          <Pressable
            as="button"
            type="button"
            data-draft-action
            feedback="highlight"
            p={1}
            aria-label={`Discard ${row.title}`}
            onClick={() => void discard(row.gistId)}
          >
            <TrashMark />
          </Pressable>
        </DraftRow>
      ))}
    </Flex>
  )
}
