import { useState } from 'react'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import type { useGitHubAuth } from '../../hooks/useGitHubAuth'

/**
 * The account panel: the token form while signed out, the connected account
 * once a token is stored. Driven by props rather than calling `useGitHubAuth`
 * itself, because the rail row renders from the same session — see
 * `EditorSidebar`.
 */
export type GitHubAuthProps = ReturnType<typeof useGitHubAuth>

export function GitHubAuth({
  login,
  error,
  isSaving,
  signIn,
  signOut,
  openTokenSettings,
}: Readonly<GitHubAuthProps>) {
  const [token, setToken] = useState('')

  const submit = async () => {
    if (await signIn(token)) setToken('')
  }

  return (
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
          <Button type="button" variant="text" size="sm" onClick={() => void openTokenSettings()}>
            Get a token
          </Button>
        </>
      )}
    </Flex>
  )
}
