import { useRef, type ReactNode } from 'react'
import { styled, type Theme } from 'src/theme'
import { View, type ViewProps } from 'src/theme/View'
import { Button } from 'src/theme/Button'
import { Icon } from 'src/theme/Icon'
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard'

// Maps highlight.js token classes to the theme's `syntax` tokens. Descendant
// selectors are required because `rehype-highlight` emits `<span class="hljs-*">`
// children inside the code element that props can't reach. Colors come from the
// active theme, so blocks re-tint for light and dark automatically.
const syntaxStyles = ({ theme }: { theme: Theme }) => ({
  color: theme.syntax.base,
  fontFamily: theme.fonts.mono,
  // `.hljs-meta.prompt_` is the shell `$`/`#` CLI prompt — dim it like a comment.
  '& .hljs-comment, & .hljs-quote, & .hljs-doctag, & .hljs-meta.prompt_': {
    color: theme.syntax.comment,
    fontStyle: 'italic',
  },
  '& .hljs-keyword, & .hljs-built_in, & .hljs-literal, & .hljs-selector-tag, & .hljs-selector-pseudo, & .hljs-selector-attr':
    { color: theme.syntax.keyword },
  // Two-class selectors (specificity 0,2,0) win over the single-class rules below.
  '& .hljs-type, & .hljs-title.class_': { color: theme.syntax.type },
  '& .hljs-string, & .hljs-regexp, & .hljs-char, & .hljs-meta .hljs-string, & .hljs-addition': {
    color: theme.syntax.string,
  },
  '& .hljs-number, & .hljs-symbol, & .hljs-bullet, & .hljs-link': { color: theme.syntax.number },
  '& .hljs-variable.constant_, & .hljs-property': { color: theme.syntax.constant },
  '& .hljs-title, & .hljs-section, & .hljs-attr, & .hljs-attribute, & .hljs-selector-id': {
    color: theme.syntax.title,
  },
  '& .hljs-tag, & .hljs-name, & .hljs-meta, & .hljs-variable, & .hljs-selector-class, & .hljs-deletion':
    { color: theme.syntax.tag },
  '& .hljs-emphasis': { fontStyle: 'italic' },
  '& .hljs-strong': { fontWeight: 'bold' },
})

// The horizontally scrollable surface: terminal background + token theming.
const CodeSurface = styled(View, { label: 'CodeSurface' })<ViewProps>(syntaxStyles)

// Owns the reveal of the copy control. No overflow here so the sticky button
// escapes to the page scroll (the surface keeps its own horizontal overflow).
// The control is hidden until hover/focus, and always shown where hover is absent.
const Wrapper = styled(View, { label: 'CodeBlock' })({
  '& .code-copy': { opacity: 0, transition: 'opacity 120ms ease' },
  '&:hover .code-copy, &:focus-within .code-copy': { opacity: 1 },
  '@media (hover: none)': { '& .code-copy': { opacity: 1 } },
})

export interface CodeBlockProps {
  children: ReactNode
}

/**
 * Fenced-code block: a horizontally scrollable, syntax-highlighted surface with a
 * copy-to-clipboard button that sticks to the top-right while the block is in view.
 */
export function CodeBlock({ children }: Readonly<CodeBlockProps>) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = () => {
    // The button lives outside the surface, so the surface's textContent is the code
    // alone. Drop the fence's trailing newline(s) so the clipboard gets clean text.
    const text = surfaceRef.current!.textContent!.replace(/\n+$/, '')
    if (text) copy(text)
  }

  return (
    <Wrapper my={2} position="relative">
      <View
        position="absolute"
        top="8px"
        right="8px"
        zIndex={1}
        bg="paper"
        borderRadius="sm"
        className="code-copy"
      >
        <Button
          type="button"
          variant="outlined"
          color="default"
          size="sm"
          borderRadius="sm"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          <Icon
            name={copied ? 'check' : 'content_copy'}
            color={copied ? 'success' : 'primary'}
            size="1.1rem"
          />
        </Button>
      </View>
      <CodeSurface
        as="pre"
        ref={surfaceRef}
        bg="terminal"
        p={3}
        borderRadius="md"
        borderColor="light"
        borderWidth="thin"
        overflow="auto"
      >
        {children}
      </CodeSurface>
    </Wrapper>
  )
}
