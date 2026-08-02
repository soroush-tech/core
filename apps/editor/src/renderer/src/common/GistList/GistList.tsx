import { useState } from 'react'
import { Flex } from '@soroush.tech/design-system/Flex'
import { LinearProgress } from '@soroush.tech/design-system/LinearProgress'
import { Pagination } from '@soroush.tech/design-system/Pagination'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import type { GistSummary } from '../../../../shared/ipc'
import { useGists } from '../../hooks/useGists'
import { startGistDrag } from '../../utils/gistDrag'
import { GISTS_PER_PAGE } from './const'

export interface GistListProps {
  /** The gist whose files are currently shown, so the row can read as selected. */
  selectedId: string | null
  onSelect: (gist: GistSummary) => void
}

/** The account's gists in the rail's panel column, a page at a time. */
export function GistList({ selectedId, onSelect }: Readonly<GistListProps>) {
  const { gists, error, isLoading } = useGists()
  const [page, setPage] = useState(1)

  const isSettled = !isLoading && !error
  const pageCount = Math.ceil(gists.length / GISTS_PER_PAGE)
  const shown = gists.slice((page - 1) * GISTS_PER_PAGE, page * GISTS_PER_PAGE)

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

      {isSettled && gists.length === 0 && (
        <Typography variant="caption" color="secondary" m={0}>
          No gists yet.
        </Typography>
      )}

      {shown.map((gist) => (
        <Pressable
          key={gist.id}
          as="button"
          type="button"
          feedback="highlight"
          p={1}
          aria-pressed={gist.id === selectedId}
          onClick={() => onSelect(gist)}
          // Draggable onto the Claude panel, to write from what is in it.
          draggable
          onDragStart={(event) => startGistDrag(event.dataTransfer, gist.id)}
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

      {isSettled && gists.length > 0 && (
        <Flex flexDirection="column" gap={1} alignItems="center">
          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={page}
              size="sm"
              siblingCount={0}
              boundaryCount={1}
              onChange={setPage}
              aria-label="Gist pages"
            />
          )}
          <Typography variant="caption" color="secondary" m={0}>
            {gists.length === 1 ? '1 gist' : `${String(gists.length)} gists`}
          </Typography>
        </Flex>
      )}
    </Flex>
  )
}
