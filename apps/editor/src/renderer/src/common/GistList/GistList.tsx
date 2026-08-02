import { Flex } from '@soroush.tech/design-system/Flex'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import type { GistSummary } from '../../../../shared/ipc'
import { useGists } from '../../hooks/useGists'

export interface GistListProps {
  /** The gist whose files are currently shown, so the row can read as selected. */
  selectedId: string | null
  onSelect: (gist: GistSummary) => void
}

/** The account's gists in the rail's panel column. */
export function GistList({ selectedId, onSelect }: Readonly<GistListProps>) {
  const { gists, error, isLoading } = useGists()

  return (
    <Flex flexDirection="column" gap={2} p={3} minHeight={0} overflow="auto">
      <Typography variant="h6" m={0}>
        Gists
      </Typography>

      {isLoading && <LinearProgress />}

      {error && (
        <Typography role="alert" variant="caption" color="error" m={0}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && gists.length === 0 && (
        <Typography variant="caption" color="secondary" m={0}>
          No gists yet.
        </Typography>
      )}

      {gists.map((gist) => (
        <Pressable
          key={gist.id}
          as="button"
          type="button"
          feedback="highlight"
          p={1}
          aria-pressed={gist.id === selectedId}
          onClick={() => onSelect(gist)}
        >
          <Flex flexDirection="column">
            {gist.description && (
              <Typography variant="caption" color="initial" mb={1}>
                {gist.description}
              </Typography>
            )}
            <Typography variant="caption" color="secondary" m={0}>
              {gist.fileCount === 1 ? '1 file' : `${String(gist.fileCount)} files`} ·{' '}
              {gist.isPublic ? 'Public' : 'Secret'}
            </Typography>
          </Flex>
        </Pressable>
      ))}
    </Flex>
  )
}
