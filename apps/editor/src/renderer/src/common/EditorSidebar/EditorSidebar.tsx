import { useEffect, useState } from 'react'
import { Avatar } from '@soroush.tech/design-system/Avatar'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Sidebar } from '@soroush.tech/design-system/Sidebar'
import { isNewGist, newGistId, type GistOrigin } from '../../../../shared/ipc'
import { GithubMark } from '../../assets/GithubMark'
import { PlusMark } from '../../assets/PlusMark'
import { useGitHubAuth } from '../../hooks/useGitHubAuth'
import { DraftList } from '../DraftList'
import { GistFiles } from '../GistFiles'
import { DEFAULT_FILE } from '../GistFiles/const'
import { GistList } from '../GistList'
import { GitHubAuth } from '../GitHubAuth'
import { SidebarPanelItem } from './SidebarPanelItem'

type PanelKey = 'files' | 'gists' | 'drafts' | 'account'

export interface EditorSidebarProps {
  /** Loads a gist file's content into the document for editing. */
  onOpenFile: (content: string, origin: GistOrigin) => void
  /** Tells the document that the file it is on has been renamed. */
  onRenameFile: (gistId: string, from: string, to: string) => void
  /**
   * Tells the document that the sandbox it is on has become a real gist, so it
   * can follow the work to where the work now lives.
   */
  onPublished: (from: string, to: string) => void
}

/**
 * The left rail: files of the selected gist, the gist list, unfinished drafts,
 * and the GitHub account pinned to the bottom. One panel column serves them
 * all, so selecting a row closes the others — and selecting the open row
 * closes it.
 *
 * Only the gist's id is held here: the Files panel reads the description from
 * the gist itself, so a gist reached from the draft list knows as much as one
 * picked from the list.
 */
export function EditorSidebar({
  onOpenFile,
  onRenameFile,
  onPublished,
}: Readonly<EditorSidebarProps>) {
  const auth = useGitHubAuth()
  // Open on a sandbox rather than nothing, so a file or a description can be
  // written straight away. An untouched one is never persisted, so starting
  // here leaves no draft behind unless something is actually put in it.
  const [selected, setSelected] = useState<PanelKey | null>('files')
  const [startupSandbox] = useState(newGistId)
  const [gistId, setGistId] = useState<string | null>(startupSandbox)

  const toggle = (key: PanelKey) => setSelected(selected === key ? null : key)

  // Picking a gist is a request to see its files, so the panel follows it there.
  const openGist = (id: string) => {
    setGistId(id)
    setSelected('files')
  }

  /**
   * A sandbox has no file to pick, so the document is pointed at one: saving
   * then stages into the sandbox rather than writing to disk, and the file can
   * be renamed once it is there.
   */
  const openSandbox = (id: string) => {
    openGist(id)
    onOpenFile('', { gistId: id, filename: DEFAULT_FILE })
  }

  // The sandbox the app opened on needs the same treatment — otherwise the
  // document it starts with belongs to nothing and cannot be published. Both
  // dependencies are stable, so this happens once.
  useEffect(() => {
    onOpenFile('', { gistId: startupSandbox, filename: DEFAULT_FILE })
  }, [onOpenFile, startupSandbox])

  return (
    <Sidebar aria-label="Editor panels" isOpen={false} hasPanel panelWidth="20rem">
      {/* Not a panel of its own — it opens Files on a gist that exists only
          locally, so the same panel does the work. */}
      <Pressable
        as="button"
        type="button"
        feedback="highlight"
        p={2}
        aria-label="New gist"
        // A fresh id every time: pressing it never reopens the last one.
        onClick={() => openSandbox(newGistId())}
      >
        <PlusMark />
      </Pressable>
      <SidebarPanelItem
        icon={<Icon name="folder" />}
        label="Files"
        isSelected={selected === 'files'}
        onSelect={() => toggle('files')}
      >
        <GistFiles
          // Another gist is another panel: a name half-typed for the last one, a
          // rename left open, or a visibility chosen for a sandbox must not be
          // carried over and applied here. Remounting asks for all of it again.
          key={gistId}
          gistId={gistId}
          onOpenFile={onOpenFile}
          onRenamed={onRenameFile}
          // Once created, the sandbox is gone — its draft with it. The panel
          // follows the work to the gist that now holds it rather than opening
          // an empty one: what was just published is the thing to be looking at,
          // and the document would otherwise be left on an address that no
          // longer exists.
          onPublished={(sandbox, published) => {
            if (!isNewGist(sandbox)) return
            openGist(published)
            onPublished(sandbox, published)
          }}
        />
      </SidebarPanelItem>
      <SidebarPanelItem
        icon={<Icon name="edit_note" />}
        label="Drafts"
        isSelected={selected === 'drafts'}
        onSelect={() => toggle('drafts')}
      >
        <DraftList selectedId={gistId} onSelect={openGist} />
      </SidebarPanelItem>

      <SidebarPanelItem
        icon={<Icon name="code" />}
        label="Gists"
        isSelected={selected === 'gists'}
        onSelect={() => toggle('gists')}
      >
        <GistList selectedId={gistId} onSelect={(gist) => openGist(gist.id)} />
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
