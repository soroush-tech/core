import { styled } from '@soroush.tech/design-system'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import { useEffect, useState } from 'react'
import { CrossMark } from '../../assets/CrossMark'

/** Info-coloured and spanning the window - news, not an alarm. */
const Bar = styled(Flex)`
  background-color: ${({ theme }) => theme.palette.info.main};
  color: ${({ theme }) => theme.palette.info.contrastText};
`

/** The palette's own button colours would vanish against the info bar - inherit its instead. */
const InstallButton = styled(Button)`
  color: inherit;
  border-color: currentColor;
`

/**
 * Says a new version is downloaded and ready. Nothing renders until main sends
 * the word - the check, the download, and the install on quit all happen
 * without the renderer's help, so the banner exists only to offer the shortcut:
 * Update restarts straight into the new version. Dismissing it declines the
 * shortcut, nothing more - the update still installs on quit.
 */
export function UpdateBanner() {
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => window.editorAPI.update.onDownloaded(setVersion), [])

  if (version === null) return null

  return (
    <Bar role="status" flexDirection="row" alignItems="center" gap={2} p={1}>
      {/* Matching flexible margins keep the message centered while Dismiss holds the edge. */}
      <Flex flex={1} />
      <Typography variant="body2" color="inherit" m={0}>
        A new update is available - version {version} is ready to install.
      </Typography>
      <InstallButton
        type="button"
        variant="outlined"
        size="sm"
        onClick={() => void window.editorAPI.update.install()}
      >
        Update
      </InstallButton>
      <Flex flex={1} justifyContent="flex-end">
        <Pressable
          as="button"
          type="button"
          feedback="highlight"
          p={1}
          aria-label="Dismiss"
          onClick={() => setVersion(null)}
        >
          <CrossMark />
        </Pressable>
      </Flex>
    </Bar>
  )
}
