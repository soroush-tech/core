import { styled, type Theme } from 'src/theme'
import { View, type ViewProps } from 'src/theme/View'

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

export type CodeBlockProps = ViewProps

/** Fenced-code container: the `background.terminal` surface plus highlight.js token theming. */
export const CodeBlock = styled(View, { label: 'CodeBlock' })<CodeBlockProps>(syntaxStyles)
