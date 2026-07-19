import { Flex } from '@soroush.tech/design-system/Flex'
import { Button } from '@soroush.tech/design-system/Button'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { type ViewProps } from '@soroush.tech/design-system/View'
import { useCopyToClipboard } from '@soroush.tech/hooks/useCopyToClipboard'

export interface CommandSnippetProps extends ViewProps {
  /** Shell command shown after a `$` prompt and copied to the clipboard on click. */
  command: string
}

/**
 * A terminal-style snippet of a single shell command with a copy-to-clipboard button. The button
 * briefly swaps to a checkmark to confirm the copy. Layout/spacing props (e.g. `maxWidth`, `mb`)
 * pass through to the container.
 */
export function CommandSnippet({ command, ...rest }: Readonly<CommandSnippetProps>) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      bg="default"
      borderColor="light"
      borderWidth="thin"
      borderStyle="solid"
      borderRadius="md"
      pl={4}
      pr={2}
      py={1}
      overflow="auto"
      {...rest}
    >
      <Typography as="code" variant="body2" fontFamily="mono" color="primary" m={0}>
        <Typography as="span" variant="inherit" color="secondary">
          ${' '}
        </Typography>
        {command}
      </Typography>
      <Button
        variant="text"
        size="sm"
        onClick={() => copy(command)}
        aria-label={copied ? 'Copied' : 'Copy command'}
      >
        <Icon
          name={copied ? 'check' : 'content_copy'}
          color={copied ? 'success' : 'primary'}
          size="1.1rem"
        />
      </Button>
    </Flex>
  )
}
