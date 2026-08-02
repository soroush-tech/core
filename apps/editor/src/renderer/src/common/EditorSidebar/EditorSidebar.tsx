import { useState } from 'react'
import { Avatar } from '@soroush.tech/design-system/Avatar'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Sidebar } from '@soroush.tech/design-system/Sidebar'
import type { GistOrigin, GistSummary } from '../../../../shared/ipc'
import { GithubMark } from '../../assets/GithubMark'
import { useGitHubAuth } from '../../hooks/useGitHubAuth'
import { GistFiles } from '../GistFiles'
import { GistList } from '../GistList'
import { GitHubAuth } from '../GitHubAuth'
import { SidebarPanelItem } from './SidebarPanelItem'

type PanelKey = 'files' | 'gists' | 'account'

export interface EditorSidebarProps {
  /** Loads a gist file into the document for editing, tagged with where it came from. */
  onOpenFile: (content: string, origin: GistOrigin) => void
}

/**
 * The left rail: files of the selected gist, the gist list, and the GitHub
 * account pinned to the bottom. One panel column serves all three, so
 * selecting a row closes the others — and selecting the open row closes it.
 *
 * The account session is read here rather than inside `GitHubAuth` because the
 * rail row and the panel both render from it: signing in has to swap the mark
 * for the avatar in the same tick it fills the panel.
 */
export function EditorSidebar({ onOpenFile }: Readonly<EditorSidebarProps>) {
  const auth = useGitHubAuth()
  const [selected, setSelected] = useState<PanelKey | null>(null)
  const [gist, setGist] = useState<GistSummary | null>(null)

  const toggle = (key: PanelKey) => setSelected(selected === key ? null : key)

  // Picking a gist is a request to see its files, so the panel follows it there.
  const selectGist = (next: GistSummary) => {
    setGist(next)
    setSelected('files')
  }

  return (
    <Sidebar aria-label="Editor panels" isOpen={false} hasPanel panelWidth="20rem">
      <SidebarPanelItem
        icon={<Icon name="folder" />}
        label="Files"
        isSelected={selected === 'files'}
        onSelect={() => toggle('files')}
      >
        <GistFiles
          gistId={gist?.id ?? null}
          gistDescription={gist?.description ?? null}
          onOpenFile={onOpenFile}
        />
      </SidebarPanelItem>

      <SidebarPanelItem
        icon={<Icon name="code" />}
        label="Gists"
        isSelected={selected === 'gists'}
        onSelect={() => toggle('gists')}
      >
        <GistList selectedId={gist?.id ?? null} onSelect={selectGist} />
      </SidebarPanelItem>

      <SidebarPanelItem
        atEnd
        icon={
          auth.login ? (
            <Avatar size="sm" src={auth.avatar ?? undefined} alt={`@${auth.login}`}>
              {auth.login.slice(0, 1).toUpperCase()}
            </Avatar>
          ) : (
            <GithubMark />
          )
        }
        label="GitHub"
        isSelected={selected === 'account'}
        onSelect={() => toggle('account')}
      >
        <GitHubAuth {...auth} />
      </SidebarPanelItem>
    </Sidebar>
  )
}
