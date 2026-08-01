import { useContext, useEffect, useState } from 'react'
import { Avatar } from '@soroush.tech/design-system/Avatar'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Portal } from '@soroush.tech/design-system/Portal'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { SidebarContext } from '@soroush.tech/design-system/Sidebar'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { GithubMark } from '../../assets/GithubMark'
import { useGitHubAuth } from '../../hooks/useGitHubAuth'

const PANEL_LABEL = 'GitHub'

/**
 * The rail's bottom row: GitHub's mark while signed out, the account avatar
 * once a token is stored. Selecting it opens the rail's panel column, which
 * holds the token form or the connected account.
 *
 * Not a `SidebarItem` — that takes its icon by registry name and the mark is a
 * local asset — so this ports into the panel itself, through the same
 * `SidebarContext` contract `SidebarItem` uses.
 */
export function GitHubAuth() {
  const { login, avatar, error, isSaving, signIn, signOut, openTokenSettings } = useGitHubAuth()
  const { panelId, panelNode, setPanelLabel } = useContext(SidebarContext)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [token, setToken] = useState('')

  // Only the name travels through context; the content below is ported.
  useEffect(() => {
    if (!isPanelOpen || !setPanelLabel) return
    setPanelLabel(PANEL_LABEL)
    return () => setPanelLabel(null)
  }, [isPanelOpen, setPanelLabel])

  const submit = async () => {
    if (await signIn(token)) setToken('')
  }

  return (
    <>
      <Pressable
        as="button"
        type="button"
        feedback="highlight"
        mt="auto"
        p={2}
        aria-label={login ? `GitHub — signed in as @${login}` : 'GitHub — not signed in'}
        aria-expanded={isPanelOpen}
        aria-controls={isPanelOpen ? panelId : undefined}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        {login ? (
          <Avatar size="sm" src={avatar ?? undefined} alt={`@${login}`}>
            {login.slice(0, 1).toUpperCase()}
          </Avatar>
        ) : (
          <GithubMark />
        )}
      </Pressable>

      {isPanelOpen && panelNode && (
        <Portal container={panelNode}>
          <Flex flexDirection="column" gap={2} p={3}>
            <Typography variant="h6" m={0}>
              GitHub
            </Typography>

            {error && (
              <Typography role="alert" variant="caption" color="error" m={0}>
                {error}
              </Typography>
            )}

            {login ? (
              <>
                <Typography variant="body2" m={0}>
                  Connected as @{login}
                </Typography>
                <Button type="button" variant="outlined" size="sm" onClick={() => void signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Typography variant="caption" color="secondary" m={0}>
                  Paste a fine-grained personal access token with “Gists: Read and write”.
                </Typography>
                <TextInput
                  type="password"
                  size="sm"
                  fullWidth
                  value={token}
                  placeholder="github_pat_…"
                  onChange={(event) => setToken(event.target.value)}
                  inputProps={{ 'aria-label': 'GitHub personal access token' }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  disabled={token.trim() === '' || isSaving}
                  onClick={() => void submit()}
                >
                  Connect
                </Button>
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => void openTokenSettings()}
                >
                  Get a token
                </Button>
              </>
            )}
          </Flex>
        </Portal>
      )}
    </>
  )
}
